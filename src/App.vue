<template>
  <div class="min-h-screen bg-navy-950 flex font-sans text-text-main transition-colors duration-500">
    <!-- Sidebar (Desktop only) -->
    <aside v-if="auth.isAuthenticated" class="hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 w-64 bg-navy-900/80 backdrop-blur-xl border-r border-navy-800/10">
      <!-- Logo -->
      <div class="p-6 border-b border-navy-800/20 text-center flex flex-col items-center">
        <router-link to="/" class="flex flex-col items-center gap-3 group">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/30 group-hover:shadow-accent-500/50 transition-shadow">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h1 class="text-sm font-bold text-text-main tracking-tight">Meeting Recorder</h1>
            <p class="text-[10px] text-accent-500 uppercase tracking-widest font-black mt-1">AI Analyzer</p>
          </div>
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-2 mt-2">
        <router-link to="/" class="nav-link" active-class="nav-link-active" exact>
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span>{{ $t('nav.dashboard') }}</span>
        </router-link>

        <router-link to="/record" class="nav-link" active-class="nav-link-active">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>{{ $t('nav.new_record') }}</span>
        </router-link>

        <router-link to="/settings" class="nav-link" active-class="nav-link-active">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a13.247 13.247 0 01-1.022-2.213m.01-9.18a13.233 13.233 0 011.01-2.214c.26-.546.908-.8 1.488-.515l.683.337c.547.27.785.92.539 1.486a13.24 13.24 0 00-.99 2.709m.73 3.49h8.25m0-3.493a1.39 1.39 0 011.392 1.392v3.493a1.39 1.39 0 01-1.392 1.392h-8.25a1.39 1.39 0 01-1.392-1.392V9.01a1.39 1.39 0 011.392-1.392z" />
          </svg>
          <span>{{ $t('nav.settings') }}</span>
        </router-link>

        <router-link v-if="auth.isAdmin" to="/admin" class="nav-link" active-class="nav-link-active">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span>{{ $t('nav.admin_dashboard') }}</span>
        </router-link>
      </nav>

      <!-- Desktop Sidebar Bottom Profile -->
      <div class="p-4 border-t border-navy-800/30 flex flex-col gap-3">
        <div class="flex items-center gap-3 px-2 py-1">
          <div class="w-9 h-9 rounded-full bg-accent-500/10 border border-accent-500/20 flex items-center justify-center font-bold text-accent-500 text-xs">
            {{ auth.currentUser?.username.substring(0, 2).toUpperCase() }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs font-bold text-text-main truncate">{{ auth.currentUser?.username }}</p>
            <p class="text-[9px] text-text-muted uppercase tracking-wider font-extrabold">{{ auth.currentUser?.role }}</p>
          </div>
        </div>
        <button 
          @click="handleLogout" 
          class="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 hover:border-red-500/30 text-red-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          {{ $t('auth.logout') }}
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main 
      class="flex-1 w-full min-h-screen flex flex-col overflow-x-hidden"
      :class="auth.isAuthenticated ? 'lg:ml-64 pb-16 lg:pb-0' : 'pb-0'"
    >
      <!-- Content Area -->
      <div class="px-4 py-8 lg:p-10 flex-1 max-w-7xl mx-auto w-full">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Bottom Navigation (Mobile Only) -->
    <nav v-if="auth.isAuthenticated" class="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-navy-900/95 backdrop-blur-xl border-t border-navy-800/80 shadow-2xl safe-area-bottom">
      <div class="flex items-center justify-around h-16 max-w-md mx-auto relative px-2">
        <router-link to="/" class="mobile-nav-link" exact-active-class="mobile-nav-active">
          <svg class="w-[22px] h-[22px] mb-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span class="text-[10px] font-bold uppercase">{{ $t('nav.dashboard') }}</span>
        </router-link>

        <router-link v-if="auth.isAdmin" to="/admin" class="mobile-nav-link" active-class="mobile-nav-active">
          <svg class="w-[22px] h-[22px] mb-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span class="text-[10px] font-bold uppercase">Admin</span>
        </router-link>

        <router-link to="/record" class="mobile-nav-link" active-class="mobile-nav-active">
          <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-accent-400 to-accent-600 flex items-center justify-center text-white shadow-lg shadow-accent-500/30 transform -translate-y-4 border-[3px] border-navy-950">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span class="mt-[-12px] text-[10px] font-bold uppercase">{{ $t('nav.new_record') }}</span>
        </router-link>

        <router-link to="/settings" class="mobile-nav-link" active-class="mobile-nav-active">
          <svg class="w-[22px] h-[22px] mb-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a13.247 13.247 0 01-1.022-2.213m.01-9.18a13.233 13.233 0 011.01-2.214c.26-.546.908-.8 1.488-.515l.683.337c.547.27.785.92.539 1.486a13.24 13.24 0 00-.99 2.709m.73 3.49h8.25m0-3.493a1.39 1.39 0 011.392 1.392v3.493a1.39 1.39 0 01-1.392 1.392h-8.25a1.39 1.39 0 01-1.392-1.392V9.01a1.39 1.39 0 011.392-1.392z" />
          </svg>
          <span class="text-[10px] font-bold uppercase">{{ $t('nav.settings') }}</span>
        </router-link>
      </div>
    </nav>

    <!-- Toast container (Centered) -->
    <div class="fixed top-6 left-1/2 -translate-x-1/2 z-[100] space-y-3 w-full max-w-xs sm:max-w-md pointer-events-none px-4">
      <TransitionGroup name="toast">
        <div 
          v-for="t in toasts" 
          :key="t.id"
          class="px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border text-sm font-bold flex items-center gap-3 pointer-events-auto mx-auto w-fit min-w-[180px] justify-center"
          :class="{
            'bg-success-500/10 border-success-500/20 text-success-500': t.type === 'success',
            'bg-danger-500/10 border-danger-500/20 text-danger-500': t.type === 'error',
            'bg-accent-500/10 border-accent-500/20 text-accent-500': t.type === 'info'
          }"
        >
          <svg v-if="t.type === 'success'" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
          <svg v-else-if="t.type === 'error'" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          <svg v-else class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {{ t.message }}
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { toasts } = useToast()
const settings = useSettingsStore()
const auth = useAuthStore()
const router = useRouter()
const { locale } = useI18n()

// Theme application
const applyTheme = (theme) => {
  let mode = theme
  if (theme === 'system') {
    mode = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  }
  
  if (mode === 'light') {
    document.documentElement.classList.add('light')
  } else {
    document.documentElement.classList.remove('light')
  }
}

const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}

// Watch theme changes
watch(() => settings.theme, (newTheme) => {
  applyTheme(newTheme)
}, { immediate: true })

// Watch language changes
watch(() => settings.language, (newLang) => {
  locale.value = newLang
}, { immediate: true })

onMounted(() => {
  // Respect system theme changes
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    if (settings.theme === 'system') {
      applyTheme('system')
    }
  })
})
</script>

<style>
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1.25rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-text-muted);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover {
  color: var(--color-text-main);
  background: var(--color-navy-800);
}

.nav-link.nav-link-active {
  color: var(--color-accent-500);
  background: color-mix(in srgb, var(--color-accent-500) 12%, transparent);
  box-shadow: inset 3px 0 0 0 var(--color-accent-500);
}

.mobile-nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding-top: 0.5rem;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
}

.mobile-nav-link svg {
  opacity: 0.6;
}

.mobile-nav-link.mobile-nav-active {
  color: var(--color-accent-500);
}

.mobile-nav-link.mobile-nav-active svg {
  opacity: 1;
  transform: scale(1.1);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Base skeleton style */
.skeleton {
  background: linear-gradient(90deg, var(--color-navy-800) 25%, var(--color-navy-700) 50%, var(--color-navy-800) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
