<template>
  <div class="min-h-[80vh] flex items-center justify-center p-4">
    <div class="w-full max-w-md relative">
      <!-- Glow backgrounds -->
      <div class="absolute -top-12 -left-12 w-64 h-64 bg-accent-600/20 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute -bottom-12 -right-12 w-64 h-64 bg-accent-400/20 rounded-full blur-3xl pointer-events-none" />

      <!-- Card container -->
      <div class="relative glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-navy-800/10 overflow-hidden">
        <!-- Logo Header -->
        <div class="flex flex-col items-center gap-3 mb-8 text-center">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/30">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-extrabold tracking-tight text-text-main">Meeting Recorder</h2>
            <p class="text-[10px] text-accent-500 uppercase tracking-widest font-black mt-1">AI Analyzer Platform</p>
          </div>
        </div>

        <!-- Mode Toggle Tabs -->
        <div class="flex gap-1 bg-navy-900/60 p-1 rounded-2xl border border-navy-800/50 mb-6">
          <button 
            @click="setMode('login')"
            class="flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300"
            :class="mode === 'login' ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' : 'text-text-muted hover:text-text-main'"
          >
            {{ $t('auth.login') }}
          </button>
          <button 
            @click="setMode('register')"
            class="flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300"
            :class="mode === 'register' ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' : 'text-text-muted hover:text-text-main'"
          >
            {{ $t('auth.register') }}
          </button>
        </div>

        <!-- Errors -->
        <div v-if="localError" class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 text-center font-bold flex items-center justify-center gap-2">
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {{ localError }}
        </div>

        <!-- Form fields -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Username / Email -->
          <div class="space-y-1">
            <label class="text-[10px] uppercase font-black text-text-muted tracking-wider px-1">{{ mode === 'login' ? $t('auth.username') + ' / Email' : $t('auth.username') }}</label>
            <div class="relative">
              <input 
                v-model="form.username" 
                type="text" 
                required
                :placeholder="mode === 'login' ? 'Nhập tên tài khoản hoặc email...' : 'Nhập tên tài khoản...'"
                class="w-full px-4 py-3 bg-navy-800/40 border border-navy-700/50 rounded-xl text-text-main text-sm placeholder:text-text-muted/40 focus:outline-none focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/10 transition-all shadow-inner"
              />
            </div>
          </div>

          <!-- Email (Register Only) -->
          <div v-if="mode === 'register'" class="space-y-1">
            <label class="text-[10px] uppercase font-black text-text-muted tracking-wider px-1">{{ $t('auth.email') }}</label>
            <div class="relative">
              <input 
                v-model="form.email" 
                type="email" 
                required
                placeholder="email@example.com"
                class="w-full px-4 py-3 bg-navy-800/40 border border-navy-700/50 rounded-xl text-text-main text-sm placeholder:text-text-muted/40 focus:outline-none focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/10 transition-all shadow-inner"
              />
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-1">
            <div class="flex justify-between items-center px-1">
              <label class="text-[10px] uppercase font-black text-text-muted tracking-wider">{{ $t('auth.password') }}</label>
            </div>
            <div class="relative">
              <input 
                v-model="form.password" 
                :type="showPassword ? 'text' : 'password'" 
                required
                :placeholder="mode === 'login' ? 'Nhập mật khẩu...' : 'Tối thiểu 6 ký tự...'"
                class="w-full px-4 py-3 pr-10 bg-navy-800/40 border border-navy-700/50 rounded-xl text-text-main text-sm placeholder:text-text-muted/40 focus:outline-none focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/10 transition-all shadow-inner"
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main cursor-pointer"
              >
                <svg v-if="showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            :disabled="auth.loading"
            class="w-full mt-4 py-3 bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 hover:from-accent-300 hover:to-accent-500 text-white font-bold rounded-xl shadow-lg shadow-accent-500/25 transition-all active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg v-if="auth.loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ mode === 'login' ? $t('auth.login_btn') : $t('auth.register_btn') }}
          </button>
        </form>

        <!-- Help Footer -->
        <div class="mt-6 text-center text-xs text-text-muted">
          <p v-if="mode === 'login'">
            {{ $t('auth.no_account') }} 
            <span @click="setMode('register')" class="text-accent-500 font-bold cursor-pointer hover:underline">{{ $t('auth.register') }}</span>
          </p>
          <p v-else>
            {{ $t('auth.has_account') }} 
            <span @click="setMode('login')" class="text-accent-500 font-bold cursor-pointer hover:underline">{{ $t('auth.login') }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const auth = useAuthStore()
const { success, error: toastError } = useToast()
const { t } = useI18n()

const mode = ref('login')
const showPassword = ref(false)
const localError = ref('')

const form = reactive({
  username: '',
  email: '',
  password: ''
})

function setMode(newMode) {
  mode.value = newMode
  localError.value = ''
  form.username = ''
  form.email = ''
  form.password = ''
}



async function handleSubmit() {
  localError.value = ''
  
  if (!form.username || !form.password) {
    localError.value = t('auth.error_empty')
    return
  }

  if (mode.value === 'register' && !form.email) {
    localError.value = t('auth.error_empty')
    return
  }

  if (form.password.length < 6) {
    localError.value = t('auth.error_password_length')
    return
  }

  if (mode.value === 'login') {
    const res = await auth.login(form.username, form.password)
    if (res.success) {
      success('Đăng nhập thành công')
      if (auth.isAdmin) {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } else {
      localError.value = res.message
      toastError(res.message)
    }
  } else {
    const res = await auth.register(form.username, form.email, form.password)
    if (res.success) {
      success('Đăng ký tài khoản mới thành công')
      router.push('/')
    } else {
      localError.value = res.message
      toastError(res.message)
    }
  }
}
</script>
