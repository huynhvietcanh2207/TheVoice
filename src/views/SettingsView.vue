<template>
  <div class="max-w-xl mx-auto pb-10">
    <div class="mb-8">
      <h1 class="text-2xl lg:text-3xl font-black bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 bg-clip-text text-transparent tracking-tight">{{ $t('settings.title') }}</h1>
      <p class="text-text-main font-medium text-sm mt-1.5 opacity-90">{{ $t('settings.subtitle') }}</p>
    </div>

    <!-- Group 1: Preferences -->
    <div class="space-y-4">
      <h3 class="text-[10px] uppercase tracking-[0.2em] text-text-muted font-black px-4">{{ $t('settings.personal') }}</h3>
      
      <div class="glass-card rounded-3xl overflow-hidden shadow-2xl">
        <!-- Theme Selection -->
        <div class="p-4 sm:p-5 flex items-center justify-between group active:bg-navy-800/40 transition-colors">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-2xl bg-accent-500/10 flex items-center justify-center text-accent-500">
              <svg v-if="settings.theme === 'dark'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 11.25a7.5 7.5 0 01-7.5 7.5c-3.14 0-5.833-1.92-6.945-4.629m0-5.742A7.5 7.5 0 0112 3.75a7.5 7.5 0 017.5 7.5c0 .372-.027.737-.08 1.096m-4.667-4.667A3.75 3.75 0 119 12.75l-.167.167m0 0a1.875 1.875 0 102.653 2.653l.166-.166" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-bold text-text-main">{{ $t('settings.theme') }}</p>
              <p class="text-[10px] text-text-muted uppercase font-black mt-0.5">
                {{ themeLabel }}
              </p>
            </div>
          </div>
          <div class="flex gap-1 bg-navy-800/40 p-1 rounded-xl border border-navy-800/50">
            <button 
              @click="settings.setTheme('light')"
              class="px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all"
              :class="settings.theme === 'light' ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' : 'text-text-muted hover:text-text-main'"
            > {{ $t('settings.theme_light') }} </button>
            <button 
              @click="settings.setTheme('dark')"
              class="px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all"
              :class="settings.theme === 'dark' ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' : 'text-text-muted hover:text-text-main'"
            > {{ $t('settings.theme_dark') }} </button>
            <button 
              @click="settings.setTheme('system')"
              class="px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all"
              :class="settings.theme === 'system' ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' : 'text-text-muted hover:text-text-main'"
            > {{ $t('settings.theme_system') }} </button>
          </div>
        </div>

        <div class="h-px bg-navy-800/30 mx-5" />

        <!-- Language Selection -->
        <div class="p-4 sm:p-5 flex items-center justify-between group active:bg-navy-800/40 transition-colors">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896 3.066 2.057 5.855 3.393 8.351m0 0V15.5l1.5-1.5" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-bold text-text-main">{{ $t('settings.language') }}</p>
              <p class="text-[10px] text-text-muted uppercase font-black mt-0.5">
                {{ settings.language === 'vi' ? 'Tiếng Việt' : 'English' }}
              </p>
            </div>
          </div>
          <select 
            :value="settings.language"
            @change="settings.setLanguage($event.target.value)"
            class="bg-navy-800/40 px-3 py-1.5 text-[10px] font-bold text-text-main rounded-lg border border-navy-800/50 focus:outline-none focus:border-accent-500/50 appearance-none cursor-pointer"
          >
            <option value="vi">TIẾNG VIỆT</option>
            <option value="en">ENGLISH</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Group 2: Support & Info -->
    <div class="space-y-4 mt-10">
      <h3 class="text-[10px] uppercase tracking-[0.2em] text-text-muted font-black px-4">{{ $t('settings.support') }}</h3>
      
      <div class="glass-card rounded-3xl overflow-hidden shadow-2xl">
        <!-- Support & Feedback -->
        <button @click="openLink('mailto:support@example.com')" class="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-navy-800/40 transition-colors">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379L12 21l3.62-3.62a48.913 48.913 0 005.88-1.51c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            </div>
            <div class="text-left">
              <p class="text-sm font-bold text-text-main">{{ $t('settings.feedback') }}</p>
              <p class="text-[10px] text-text-muted uppercase font-black mt-0.5 text-left">{{ $t('settings.feedback_desc') }}</p>
            </div>
          </div>
          <svg class="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <div class="h-px bg-navy-800/30 mx-5" />

        <!-- Share App -->
        <button @click="shareApp" class="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-navy-800/40 transition-colors">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </div>
            <div class="text-left">
              <p class="text-sm font-bold text-text-main">{{ $t('settings.share') }}</p>
              <p class="text-[10px] text-text-muted uppercase font-black mt-0.5 text-left">{{ $t('settings.share_desc') }}</p>
            </div>
          </div>
          <svg class="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Group 3: Account (Mobile friendly Logout) -->
    <div class="space-y-4 mt-10">
      <h3 class="text-[10px] uppercase tracking-[0.2em] text-text-muted font-black px-4">Tài khoản</h3>
      <div class="glass-card rounded-3xl overflow-hidden shadow-2xl">
        <div class="p-4 sm:p-5 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-bold text-text-main">Đăng xuất</p>
              <p class="text-[10px] text-text-muted uppercase font-black mt-0.5">Thoát phiên đăng nhập của {{ auth.currentUser?.username }}</p>
            </div>
          </div>
          <button 
            @click="handleLogout" 
            class="px-4 py-2 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 hover:border-red-500/30 text-red-500 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const settings = useSettingsStore()
const auth = useAuthStore()
const router = useRouter()
const { success } = useToast()
const { t } = useI18n()

const themeLabel = computed(() => {
  switch (settings.theme) {
    case 'light': return t('settings.theme_light')
    case 'dark': return t('settings.theme_dark')
    case 'system': return t('settings.theme_system')
    default: return ''
  }
})

function openLink(url) {
  window.location.href = url
}

const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}

async function shareApp() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Meeting Recorder AI',
        text: t('settings.share_text'),
        url: window.location.origin
      })
    } catch (err) {
      // Ignored or handled
    }
  } else {
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(window.location.origin)
      success(t('settings.share_copy_success'))
    } catch (err) {
      // Failed
    }
  }
}
</script>
