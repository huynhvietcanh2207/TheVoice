import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Local mockup data store for fallback mode
  const mockUsers = ref([])
  const isFallbackMode = ref(!isSupabaseConfigured)

  // Default mock users if none exist in localStorage
  const DEFAULT_MOCK_USERS = [
    {
      id: 'admin-id',
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // stored plain-text for mock simplicity
      role: 'admin',
      status: 'active',
      createdAt: new Date('2026-01-01').toISOString()
    },
    {
      id: 'user-id',
      username: 'user',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
      status: 'active',
      createdAt: new Date('2026-06-15').toISOString()
    }
  ]

  // Initialize store and check current session
  async function init() {
    loading.value = true
    error.value = null

    // Load local mock users
    const localUsers = localStorage.getItem('mock_users')
    if (localUsers) {
      mockUsers.value = JSON.parse(localUsers)
    } else {
      mockUsers.value = [...DEFAULT_MOCK_USERS]
      localStorage.setItem('mock_users', JSON.stringify(mockUsers.value))
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession()
        if (sessionErr) throw sessionErr

        if (session?.user) {
          // Fetch user profile info (role, status) from a custom profiles table
          const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profileErr && profileErr.code !== 'PGRST116') { // PGRST116 is code for no rows returned
            console.error('Error fetching user profile:', profileErr)
          }

          currentUser.value = {
            id: session.user.id,
            email: session.user.email,
            username: session.user.user_metadata?.username || session.user.email.split('@')[0],
            role: profile?.role || 'user',
            status: profile?.status || 'active'
          }
        } else {
          currentUser.value = null
        }
      } catch (err) {
        console.error('Supabase session initialization failed, falling back to local session.', err)
        loadLocalSession()
      }
    } else {
      loadLocalSession()
    }

    loading.value = false
  }

  function loadLocalSession() {
    const session = localStorage.getItem('mock_user_session')
    if (session) {
      currentUser.value = JSON.parse(session)
    } else {
      currentUser.value = null
    }
  }

  // Login
  async function login(usernameOrEmail, password) {
    loading.value = true
    error.value = null

    try {
      if (isSupabaseConfigured && supabase) {
        // Supabase login (by email)
        const email = usernameOrEmail.includes('@')
          ? usernameOrEmail
          : `${usernameOrEmail}@example.com` // dummy mapping if username is typed

        const { data, error: authErr } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (authErr) throw authErr

        // Fetch profile
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (profile?.status === 'blocked') {
          await supabase.auth.signOut()
          throw new Error('Tài khoản đã bị khóa bởi Admin!')
        }

        currentUser.value = {
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata?.username || email.split('@')[0],
          role: profile?.role || 'user',
          status: profile?.status || 'active'
        }

        return { success: true }
      } else {
        // Mock Login
        const normalizedInput = usernameOrEmail.trim().toLowerCase()
        const matchedUser = mockUsers.value.find(
          u => u.username.toLowerCase() === normalizedInput || u.email.toLowerCase() === normalizedInput
        )

        if (!matchedUser) {
          throw new Error('Tài khoản không tồn tại')
        }

        if (matchedUser.password !== password) {
          throw new Error('Mật khẩu không chính xác')
        }

        if (matchedUser.status === 'blocked') {
          throw new Error('Tài khoản của bạn đã bị khóa')
        }

        const userSession = {
          id: matchedUser.id,
          username: matchedUser.username,
          email: matchedUser.email,
          role: matchedUser.role,
          status: matchedUser.status
        }

        currentUser.value = userSession
        localStorage.setItem('mock_user_session', JSON.stringify(userSession))
        return { success: true }
      }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  // Register
  async function register(username, email, password) {
    loading.value = true
    error.value = null

    try {
      if (isSupabaseConfigured && supabase) {
        // Supabase Auth Register
        const { data, error: authErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username }
          }
        })

        if (authErr) throw authErr

        // Add user profile row to public.profiles table (triggers are recommended on Supabase database side, but we insert here as a fallback)
        if (data.user) {
          const { error: profileErr } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                username,
                role: 'user',
                status: 'active'
              }
            ])
          if (profileErr) console.error('Error creating profile entry:', profileErr)
        }

        return { success: true, message: 'Đăng ký thành công! Vui lòng kiểm tra email xác nhận (nếu có).' }
      } else {
        // Mock Register
        const exists = mockUsers.value.some(
          u => u.username.toLowerCase() === username.trim().toLowerCase() || u.email.toLowerCase() === email.trim().toLowerCase()
        )

        if (exists) {
          throw new Error('Tên tài khoản hoặc email đã tồn tại')
        }

        const newUser = {
          id: 'mock-id-' + Date.now(),
          username: username.trim(),
          email: email.trim(),
          password,
          role: 'user',
          status: 'active',
          createdAt: new Date().toISOString()
        }

        mockUsers.value.push(newUser)
        localStorage.setItem('mock_users', JSON.stringify(mockUsers.value))

        // Auto login on register
        const userSession = {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status
        }

        currentUser.value = userSession
        localStorage.setItem('mock_user_session', JSON.stringify(userSession))

        return { success: true }
      }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  // Logout
  async function logout() {
    loading.value = true
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut()
      }
    } catch (err) {
      console.error('Supabase logout error:', err)
    } finally {
      currentUser.value = null
      localStorage.removeItem('mock_user_session')
      loading.value = false
    }
  }

  // Fetch all accounts (Admin Only)
  async function fetchAccounts() {
    if (currentUser.value?.role !== 'admin') return []

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error: fetchErr } = await supabase
          .from('profiles')
          .select('*')
        if (fetchErr) throw fetchErr
        return data
      } catch (err) {
        console.error('Error fetching accounts from Supabase:', err)
        return mockUsers.value
      }
    } else {
      return mockUsers.value
    }
  }

  // Toggle account status (Admin Only)
  async function toggleAccountStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active'

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({ status: newStatus })
          .eq('id', userId)

        if (updateErr) throw updateErr
        return true
      } catch (err) {
        console.error('Error toggling status on Supabase:', err)
        return false
      }
    } else {
      // Mock toggle
      const idx = mockUsers.value.findIndex(u => u.id === userId)
      if (idx !== -1) {
        if (mockUsers.value[idx].username === 'admin') {
          throw new Error('Không thể khóa tài khoản admin mặc định')
        }
        mockUsers.value[idx].status = newStatus
        localStorage.setItem('mock_users', JSON.stringify(mockUsers.value))

        // If current user session is the one being blocked, they should be logged out
        if (currentUser.value && currentUser.value.id === userId && newStatus === 'blocked') {
          logout()
        }
        return true
      }
      return false
    }
  }

  // Delete account (Admin Only)
  async function deleteAccount(userId) {
    if (isSupabaseConfigured && supabase) {
      try {
        // Note: deleting in profiles table
        const { error: deleteErr } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId)

        if (deleteErr) throw deleteErr
        return true
      } catch (err) {
        console.error('Error deleting profile from Supabase:', err)
        return false
      }
    } else {
      // Mock delete
      const userToDelete = mockUsers.value.find(u => u.id === userId)
      if (userToDelete?.username === 'admin') {
        throw new Error('Không thể xóa tài khoản admin mặc định')
      }

      mockUsers.value = mockUsers.value.filter(u => u.id !== userId)
      localStorage.setItem('mock_users', JSON.stringify(mockUsers.value))

      if (currentUser.value && currentUser.value.id === userId) {
        logout()
      }
      return true
    }
  }

  // Create account manually (Admin Only)
  async function createAccount(username, email, password, role) {
    if (isSupabaseConfigured && supabase) {
      // Create user using Supabase Admin API (or just normal signup without auto login)
      throw new Error('Tạo tài khoản admin trực tiếp cần sử dụng Service Role Key của Supabase.')
    } else {
      const exists = mockUsers.value.some(
        u => u.username.toLowerCase() === username.trim().toLowerCase() || u.email.toLowerCase() === email.trim().toLowerCase()
      )

      if (exists) {
        throw new Error('Tên tài khoản hoặc email đã tồn tại')
      }

      const newUser = {
        id: 'mock-id-' + Date.now(),
        username: username.trim(),
        email: email.trim(),
        password,
        role: role || 'user',
        status: 'active',
        createdAt: new Date().toISOString()
      }

      mockUsers.value.push(newUser)
      localStorage.setItem('mock_users', JSON.stringify(mockUsers.value))
      return { success: true }
    }
  }

  const isAuthenticated = computed(() => !!currentUser.value)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  return {
    currentUser, loading, error, isFallbackMode, mockUsers,
    init, login, register, logout, isAuthenticated, isAdmin,
    fetchAccounts, toggleAccountStatus, deleteAccount, createAccount
  }
})
