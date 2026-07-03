import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const isFallbackMode = ref(false) // Giữ giá trị false để tránh lỗi biên dịch ở nơi khác

  // Khởi tạo phiên làm việc hiện tại
  async function init() {
    loading.value = true
    error.value = null

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Chưa cấu hình cơ sở dữ liệu Supabase!')
      }

      const { data: { session }, error: sessionErr } = await supabase.auth.getSession()
      if (sessionErr) throw sessionErr

      if (session?.user) {
        // Lấy thông tin vai trò/trạng thái từ bảng profiles
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileErr && profileErr.code !== 'PGRST116') {
          console.error('Error fetching user profile:', profileErr)
        }

        if (profile?.status === 'blocked') {
          await supabase.auth.signOut()
          currentUser.value = null
          throw new Error('Tài khoản đã bị khóa bởi Admin!')
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
      error.value = err.message
      currentUser.value = null
    } finally {
      loading.value = false
    }
  }

  // Đăng nhập
  async function login(usernameOrEmail, password) {
    loading.value = true
    error.value = null

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Chưa cấu hình cơ sở dữ liệu Supabase!')
      }

      const email = usernameOrEmail.includes('@')
        ? usernameOrEmail
        : `${usernameOrEmail}@example.com`

      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authErr) throw authErr

      // Lấy vai trò/trạng thái từ bảng profiles
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
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  // Đăng ký
  async function register(username, email, password) {
    loading.value = true
    error.value = null

    try {
      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Chưa cấu hình cơ sở dữ liệu Supabase!')
      }

      const { data, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      })

      if (authErr) throw authErr

      // Thêm hồ sơ người dùng vào bảng profiles (Tự động cấp quyền admin nếu tên là 'admin')
      const isInitialAdmin = username.toLowerCase().trim() === 'admin' || email.toLowerCase().trim().startsWith('admin@')
      const userRole = isInitialAdmin ? 'admin' : 'user'

      if (data.user) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              username,
              role: userRole,
              status: 'active'
            }
          ])
        if (profileErr) console.error('Error creating profile entry:', profileErr)
      }

      // Thông báo đăng ký thành công
      let message = 'Đăng ký thành công!'
      if (data?.session) {
        currentUser.value = {
          id: data.user.id,
          email: data.user.email,
          username: username,
          role: userRole,
          status: 'active'
        }
      } else {
        message = 'Đăng ký thành công! Hãy kiểm tra và xác nhận email của bạn để đăng nhập.'
      }

      return { success: true, message }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  // Đăng xuất
  async function logout() {
    loading.value = true
    try {
      if (supabase) {
        await supabase.auth.signOut()
      }
    } catch (err) {
      console.error('Supabase logout error:', err)
    } finally {
      currentUser.value = null
      loading.value = false
    }
  }

  // Lấy danh sách tài khoản (Chỉ Admin)
  async function fetchAccounts() {
    if (currentUser.value?.role !== 'admin') return []
    if (!supabase) return []

    try {
      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
      if (fetchErr) throw fetchErr
      return data
    } catch (err) {
      console.error('Error fetching accounts from Supabase:', err)
      return []
    }
  }

  // Khóa/mở khóa tài khoản (Chỉ Admin)
  async function toggleAccountStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active'
    if (!supabase) return false

    try {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId)

      if (updateErr) throw updateErr
      
      if (currentUser.value && currentUser.value.id === userId && newStatus === 'blocked') {
        logout()
      }
      return true
    } catch (err) {
      console.error('Error toggling status on Supabase:', err)
      return false
    }
  }

  // Xóa tài khoản (Chỉ Admin)
  async function deleteAccount(userId) {
    if (!supabase) return false

    try {
      const { error: deleteErr } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (deleteErr) throw deleteErr
      
      if (currentUser.value && currentUser.value.id === userId) {
        logout()
      }
      return true
    } catch (err) {
      console.error('Error deleting profile from Supabase:', err)
      return false
    }
  }

  // Admin tạo tài khoản thủ công
  async function createAccount(username, email, password, role) {
    if (!supabase) throw new Error('Chưa kết nối Supabase.')
    
    const { data, error: createErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    })

    if (createErr) throw createErr

    if (data.user) {
      const { error: profileErr } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            username,
            role: role || 'user',
            status: 'active'
          }
        ])
      if (profileErr) throw profileErr
    }

    return { success: true }
  }

  const isAuthenticated = computed(() => !!currentUser.value)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')

  return {
    currentUser, loading, error, isFallbackMode,
    init, login, register, logout, isAuthenticated, isAdmin,
    fetchAccounts, toggleAccountStatus, deleteAccount, createAccount
  }
})
