<template>
  <div class="pb-16 font-sans">
    <!-- Header -->
    <div class="mb-8 font-outfit">
      <h1 class="text-2xl lg:text-3xl font-black bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 bg-clip-text text-transparent tracking-tight">{{ $t('admin.title') }}</h1>
      <p class="text-text-main font-medium text-sm mt-1.5 opacity-90">{{ $t('admin.subtitle') }}</p>
    </div>

    <!-- Mode Toggle Tabs -->
    <div class="flex gap-2 border-b border-navy-800/80 mb-8 overflow-x-auto thin-scrollbar">
      <button 
        @click="activeTab = 'stats'"
        class="pb-4 px-4 text-sm font-bold border-b-2 transition-all duration-300 shrink-0 cursor-pointer"
        :class="activeTab === 'stats' ? 'border-accent-500 text-accent-500' : 'border-transparent text-text-muted hover:text-text-main'"
      >
        📊 {{ $t('admin.tab_stats') }}
      </button>
      <button 
        @click="activeTab = 'accounts'"
        class="pb-4 px-4 text-sm font-bold border-b-2 transition-all duration-300 shrink-0 cursor-pointer"
        :class="activeTab === 'accounts' ? 'border-accent-500 text-accent-500' : 'border-transparent text-text-muted hover:text-text-main'"
      >
        👤 {{ $t('admin.tab_accounts') }}
      </button>
      <button 
        @click="activeTab = 'ai-config'"
        class="pb-4 px-4 text-sm font-bold border-b-2 transition-all duration-300 shrink-0 cursor-pointer"
        :class="activeTab === 'ai-config' ? 'border-accent-500 text-accent-500' : 'border-transparent text-text-muted hover:text-text-main'"
      >
        ⚙️ {{ $t('admin.tab_ai_config') }}
      </button>
    </div>

    <!-- Content Tabs -->
    <div class="space-y-6">
      
      <!-- Tab 1: Statistics -->
      <div v-if="activeTab === 'stats'" class="space-y-6">
        <!-- Stats Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total accounts -->
          <div class="glass-card rounded-2xl p-5 border border-navy-800/50">
            <p class="text-[10px] text-text-muted font-black uppercase tracking-wider">{{ $t('admin.stat_total_users') }}</p>
            <p class="text-3xl font-extrabold text-text-main mt-2">{{ accounts.length }}</p>
          </div>
          <!-- Active users -->
          <div class="glass-card rounded-2xl p-5 border border-navy-800/50">
            <p class="text-[10px] text-text-muted font-black uppercase tracking-wider">{{ $t('admin.stat_active_users') }}</p>
            <p class="text-3xl font-extrabold text-emerald-500 mt-2">{{ activeCount }}</p>
          </div>
          <!-- Blocked users -->
          <div class="glass-card rounded-2xl p-5 border border-navy-800/50">
            <p class="text-[10px] text-text-muted font-black uppercase tracking-wider">{{ $t('admin.stat_blocked_users') }}</p>
            <p class="text-3xl font-extrabold text-red-500 mt-2">{{ blockedCount }}</p>
          </div>
          <!-- Total records -->
          <div class="glass-card rounded-2xl p-5 border border-navy-800/50">
            <p class="text-[10px] text-text-muted font-black uppercase tracking-wider">{{ $t('admin.stat_total_meetings') }}</p>
            <p class="text-3xl font-extrabold text-accent-500 mt-2">{{ meetingsCount }}</p>
          </div>
        </div>

        <!-- Detailed statistics cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div class="glass-card rounded-3xl p-6 border border-navy-800/50">
            <h3 class="text-sm font-bold text-text-main mb-4 flex items-center gap-2">
              🔌 Supabase Connection Status
            </h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between text-xs">
                <span class="text-text-muted">Trạng thái kết nối</span>
                <span class="px-2.5 py-1 rounded-full font-bold uppercase text-[9px]" 
                  :class="isSupabaseConfigured ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'">
                  {{ isSupabaseConfigured ? 'CONNECTED' : 'LOCAL FALLBACK' }}
                </span>
              </div>
              <div class="p-3 bg-navy-900/40 rounded-xl border border-navy-800/60 text-xs text-text-muted leading-relaxed">
                <p v-if="isSupabaseConfigured">
                  Ứng dụng đang kết nối thành công tới database Supabase Production của bạn. Mọi tài khoản và cấu hình được đồng bộ real-time.
                </p>
                <p v-else>
                  Hiện tại dự án chưa cấu hình các biến môi trường <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code>.
                  Ứng dụng đang hoạt động ở chế độ Demo (lưu trữ trong <strong>LocalStorage</strong> của trình duyệt).
                </p>
              </div>
            </div>
          </div>

          <div class="glass-card rounded-3xl p-6 border border-navy-800/50">
            <h3 class="text-sm font-bold text-text-main mb-4 flex items-center gap-2">
              🧠 AI Gemini Engine State
            </h3>
            <div class="space-y-3 text-xs text-text-muted">
              <div class="flex justify-between">
                <span>Số API key đang quay vòng:</span>
                <span class="font-bold text-text-main">{{ settings.apiKeys.length }} keys</span>
              </div>
              <div class="flex justify-between">
                <span>Model AI được cấu hình:</span>
                <span class="font-bold text-accent-500 font-mono">{{ settings.modelName }}</span>
              </div>
              <div class="flex justify-between">
                <span>Key index hiện hành:</span>
                <span class="font-bold text-text-main font-mono">{{ settings.currentKeyIndex }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Accounts Management -->
      <div v-if="activeTab === 'accounts'" class="space-y-4">
        <div class="flex justify-between items-center">
          <h2 class="text-sm font-black uppercase tracking-wider text-text-muted px-2">Danh sách tài khoản ({{ accounts.length }})</h2>
          <button 
            @click="showAddModal = true"
            class="px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-400 hover:to-accent-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            ➕ {{ $t('admin.btn_add_account') }}
          </button>
        </div>

        <div class="glass-card rounded-3xl overflow-hidden shadow-2xl border border-navy-800/50">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-navy-800 bg-navy-900/40 text-text-muted font-bold text-[10px] uppercase tracking-wider">
                  <th class="p-4 sm:p-5">{{ $t('admin.col_username') }}</th>
                  <th class="p-4 sm:p-5">{{ $t('admin.col_email') }}</th>
                  <th class="p-4 sm:p-5">{{ $t('admin.col_role') }}</th>
                  <th class="p-4 sm:p-5">{{ $t('admin.col_status') }}</th>
                  <th class="p-4 sm:p-5">{{ $t('admin.col_created') }}</th>
                  <th class="p-4 sm:p-5 text-right">{{ $t('admin.col_actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="acc in accounts" 
                  :key="acc.id"
                  class="border-b border-navy-800/40 hover:bg-navy-800/20 transition-colors"
                >
                  <td class="p-4 sm:p-5 font-bold text-text-main flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-navy-800 border border-navy-700/50 flex items-center justify-center text-[10px] font-black uppercase text-accent-500">
                      {{ acc.username.substring(0, 2) }}
                    </div>
                    {{ acc.username }}
                  </td>
                  <td class="p-4 sm:p-5 text-text-muted">{{ acc.email }}</td>
                  <td class="p-4 sm:p-5">
                    <span class="px-2 py-0.5 rounded font-black text-[9px]"
                      :class="acc.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'">
                      {{ acc.role.toUpperCase() }}
                    </span>
                  </td>
                  <td class="p-4 sm:p-5">
                    <span class="px-2.5 py-0.5 rounded-full font-bold text-[9px] inline-flex items-center gap-1"
                      :class="acc.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'">
                      <span class="w-1.5 h-1.5 rounded-full" :class="acc.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'" />
                      {{ acc.status === 'active' ? $t('admin.stat_active_users').toUpperCase() : $t('admin.stat_blocked_users').toUpperCase() }}
                    </span>
                  </td>
                  <td class="p-4 sm:p-5 text-text-muted">{{ formatDate(acc.createdAt) }}</td>
                  <td class="p-4 sm:p-5 text-right space-x-1 shrink-0">
                    <button 
                      v-if="acc.username !== 'admin'"
                      @click="toggleStatus(acc)"
                      class="px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer inline-block"
                      :class="acc.status === 'active' 
                        ? 'border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/20' 
                        : 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/20'"
                    >
                      {{ acc.status === 'active' ? $t('admin.btn_block') : $t('admin.btn_unblock') }}
                    </button>
                    <button 
                      v-if="acc.username !== 'admin'"
                      @click="confirmDelete(acc)"
                      class="px-2.5 py-1.5 rounded-lg border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/20 text-[10px] font-bold transition-all cursor-pointer inline-block"
                    >
                      {{ $t('admin.btn_delete') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab 3: AI Configuration -->
      <div v-if="activeTab === 'ai-config'" class="space-y-6">
        <!-- API Key Manager -->
        <div class="glass-card rounded-3xl p-6 border border-navy-800/50 space-y-6">
          <!-- Header with Show/Hide toggle -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-800/60 pb-4">
            <div>
              <h3 class="text-sm font-bold text-text-main flex items-center gap-2">
                <svg class="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
                Google Gemini API Keys List
              </h3>
              <p class="text-xs text-text-muted mt-1">
                Lấy các API key miễn phí tại 
                <a href="https://aistudio.google.com/apikey" target="_blank" class="text-accent-500 hover:underline font-medium">aistudio.google.com</a>.
              </p>
            </div>
            <label class="flex items-center gap-2 text-xs font-bold text-accent-500 cursor-pointer select-none bg-navy-850 px-3 py-2 rounded-xl border border-navy-800/80 hover:border-accent-500/30 transition-all shrink-0">
              <input type="checkbox" v-model="showRawKeys" class="w-4 h-4 rounded border-navy-700 bg-navy-800 text-accent-500 focus:ring-accent-500 cursor-pointer" />
              Hiển thị & Sửa đổi Key
            </label>
          </div>

          <div class="relative">
            <textarea 
              v-model="apiKeysInput"
              :readonly="!showRawKeys"
              :placeholder="showRawKeys ? 'Nhập các API key của bạn (mỗi dòng một key)...' : 'Tích chọn \'Hiển thị & Sửa đổi Key\' để xem danh sách key.'"
              rows="4"
              class="w-full px-4 py-3 bg-navy-850 border border-navy-700/50 rounded-2xl text-text-main text-sm placeholder:text-text-muted/40 focus:outline-none focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/10 transition-all font-mono resize-none shadow-inner"
              :class="!showRawKeys ? 'opacity-70 cursor-not-allowed selection:bg-transparent' : ''"
            ></textarea>
          </div>

          <!-- Active configuration status -->
          <div v-if="settings.hasApiKey" class="space-y-3">
            <div class="flex items-center gap-2 text-xs">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40" />
              <span class="text-emerald-500 font-bold">Đã cấu hình {{ settings.apiKeys.length }} API key xoay tua</span>
            </div>
            <div class="p-3 bg-navy-900/40 rounded-xl border border-navy-800/60 flex items-center justify-between text-xs font-mono">
              <span class="text-text-muted">Key đang hoạt động:</span>
              <span class="text-accent-500 font-bold">
                Thứ tự {{ settings.currentKeyIndex + 1 }} / {{ settings.apiKeys.length }} ({{ maskKey(settings.currentApiKey) }})
              </span>
            </div>
          </div>

          <div class="flex gap-3">
            <button 
              @click="saveKeys"
              class="px-5 py-2.5 bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 hover:from-accent-300 hover:to-accent-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-accent-500/20 transition-all cursor-pointer"
            >
              Lưu Danh Sách Key
            </button>
            <button 
              v-if="settings.hasApiKey"
              @click="clearKeys"
              class="px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Xóa Tất Cả Key
            </button>
          </div>
        </div>

        <!-- AI Model Selection -->
        <div class="glass-card rounded-3xl p-6 border border-navy-800/50 space-y-4">
          <div>
            <h3 class="text-sm font-bold text-text-main mb-1 flex items-center gap-2">
              <svg class="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
              </svg>
              AI Processing Engine Model
            </h3>
            <p class="text-xs text-text-muted mb-3">Lựa chọn mô hình ngôn ngữ lớn để phân tích ghi âm cuộc họp.</p>
          </div>
          <div class="relative">
            <select 
              :value="settings.modelName"
              @change="settings.setModel($event.target.value)"
              class="w-full px-4 py-3.5 pr-10 bg-navy-850 border border-navy-700/50 rounded-2xl text-text-main text-sm focus:outline-none focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/10 transition-all appearance-none cursor-pointer shadow-inner"
            >
              <option v-for="m in models" :key="m.value" :value="m.value" class="bg-navy-950 text-text-main">
                {{ m.label }}
              </option>
            </select>
            <svg class="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="w-2.5 h-2.5 rounded-full bg-accent-500" />
            <span class="text-accent-500 font-bold">Mô hình hiện tại: {{ settings.modelName }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Modals -->
    <Teleport to="body">
      <!-- Add User Account Modal -->
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="showAddModal = false" />
        <div class="relative glass rounded-3xl p-6 max-w-md w-full shadow-2xl border border-navy-800/10">
          <h3 class="text-lg font-bold text-text-main mb-4 italic">{{ $t('admin.add_account_title') }}</h3>
          
          <div v-if="modalError" class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 text-center font-bold">
            {{ modalError }}
          </div>

          <form @submit.prevent="createUser" class="space-y-4">
            <div class="space-y-1">
              <label class="text-[10px] uppercase font-black text-text-muted tracking-wider px-1">Tên tài khoản</label>
              <input 
                v-model="addForm.username" 
                type="text" 
                required 
                placeholder="Nhập tên tài khoản..."
                class="w-full px-4 py-3 bg-navy-800/40 border border-navy-700/50 rounded-xl text-text-main text-xs focus:outline-none focus:border-accent-500"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] uppercase font-black text-text-muted tracking-wider px-1">Email</label>
              <input 
                v-model="addForm.email" 
                type="email" 
                required 
                placeholder="user@example.com"
                class="w-full px-4 py-3 bg-navy-800/40 border border-navy-700/50 rounded-xl text-text-main text-xs focus:outline-none focus:border-accent-500"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] uppercase font-black text-text-muted tracking-wider px-1">Mật khẩu</label>
              <input 
                v-model="addForm.password" 
                type="password" 
                required 
                placeholder="Tối thiểu 6 ký tự..."
                class="w-full px-4 py-3 bg-navy-800/40 border border-navy-700/50 rounded-xl text-text-main text-xs focus:outline-none focus:border-accent-500"
              />
            </div>
            <div class="space-y-1">
              <label class="text-[10px] uppercase font-black text-text-muted tracking-wider px-1">Vai trò</label>
              <select 
                v-model="addForm.role"
                class="w-full px-4 py-3 bg-navy-800/45 border border-navy-700/50 rounded-xl text-text-main text-xs focus:outline-none focus:border-accent-500 cursor-pointer"
              >
                <option value="user" class="bg-navy-950">Standard User</option>
                <option value="admin" class="bg-navy-950">Administrator</option>
              </select>
            </div>

            <div class="flex gap-3 pt-4">
              <button 
                type="button" 
                @click="showAddModal = false" 
                class="flex-1 px-4 py-3 text-xs font-bold text-text-muted hover:text-text-main rounded-xl bg-navy-800 hover:bg-navy-700 transition-all cursor-pointer"
              >
                {{ $t('common.cancel') }}
              </button>
              <button 
                type="submit" 
                class="flex-1 px-4 py-3 text-xs font-bold bg-accent-500 text-white rounded-xl hover:bg-accent-400 shadow-lg shadow-accent-500/20 transition-all cursor-pointer"
              >
                {{ $t('admin.btn_add_account') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Delete User Account Confirmation -->
      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/75 backdrop-blur-sm" @click="deleteTarget = null" />
        <div class="relative glass rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-navy-800/10">
          <h3 class="text-lg font-bold text-text-main mb-2">{{ $t('admin.confirm_delete_title') }}</h3>
          <p class="text-xs text-text-muted mb-6 leading-relaxed">
            {{ $t('admin.confirm_delete_desc', { name: deleteTarget.username }) }}
          </p>
          <div class="flex gap-3">
            <button 
              @click="deleteTarget = null" 
              class="flex-1 px-4 py-3 text-xs font-bold text-text-muted hover:text-text-main rounded-xl bg-navy-800 hover:bg-navy-700 transition-all cursor-pointer"
            >
              {{ $t('common.cancel') }}
            </button>
            <button 
              @click="doDelete" 
              class="flex-1 px-4 py-3 text-xs font-bold bg-red-500 text-white rounded-xl hover:bg-red-400 shadow-lg shadow-red-500/20 transition-all cursor-pointer"
            >
              {{ $t('common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore, AVAILABLE_MODELS } from '@/stores/settings'
import { useMeetingsStore } from '@/stores/meetings'
import { useToast } from '@/composables/useToast'
import { isSupabaseConfigured } from '@/lib/supabase'

const auth = useAuthStore()
const settings = useSettingsStore()
const meetingsStore = useMeetingsStore()
const { success, error: toastError } = useToast()

const activeTab = ref('stats')
const accounts = ref([])
const showAddModal = ref(false)
const deleteTarget = ref(null)
const modalError = ref('')

const models = AVAILABLE_MODELS
const showRawKeys = ref(false)
const apiKeysInput = ref('')

function maskKey(key) {
  if (!key) return ''
  if (key.length <= 10) return '***'
  return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`
}

watch([showRawKeys, () => settings.apiKeys], () => {
  if (showRawKeys.value) {
    apiKeysInput.value = settings.apiKeys.join('\n')
  } else {
    apiKeysInput.value = settings.apiKeys.map(k => maskKey(k)).join('\n')
  }
}, { immediate: true })

const addForm = reactive({
  username: '',
  email: '',
  password: '',
  role: 'user'
})

const activeCount = computed(() => accounts.value.filter(u => u.status === 'active').length)
const blockedCount = computed(() => accounts.value.filter(u => u.status === 'blocked').length)
const meetingsCount = computed(() => meetingsStore.meetings.length)

async function loadAccounts() {
  accounts.value = await auth.fetchAccounts()
}

onMounted(async () => {
  await loadAccounts()
  await meetingsStore.loadMeetings()
})

async function toggleStatus(user) {
  try {
    const ok = await auth.toggleAccountStatus(user.id, user.status)
    if (ok) {
      success(`Đã cập nhật trạng thái tài khoản ${user.username}`)
      await loadAccounts()
    }
  } catch (err) {
    toastError(err.message)
  }
}

function confirmDelete(user) {
  deleteTarget.value = user
}

async function doDelete() {
  if (!deleteTarget.value) return
  try {
    const ok = await auth.deleteAccount(deleteTarget.value.id)
    if (ok) {
      success(`Đã xóa tài khoản ${deleteTarget.value.username}`)
      deleteTarget.value = null
      await loadAccounts()
    }
  } catch (err) {
    toastError(err.message)
  }
}

async function createUser() {
  modalError.value = ''
  if (!addForm.username || !addForm.email || !addForm.password) {
    modalError.value = 'Vui lòng nhập đầy đủ các trường thông tin!'
    return
  }
  if (addForm.password.length < 6) {
    modalError.value = 'Mật khẩu tối thiểu cần 6 ký tự trở lên!'
    return
  }

  try {
    const res = await auth.createAccount(addForm.username, addForm.email, addForm.password, addForm.role)
    if (res.success) {
      success(`Đã tạo tài khoản ${addForm.username} thành công`)
      showAddModal.value = false
      addForm.username = ''
      addForm.email = ''
      addForm.password = ''
      addForm.role = 'user'
      await loadAccounts()
    }
  } catch (err) {
    modalError.value = err.message
  }
}

async function saveKeys() {
  if (!showRawKeys.value) {
    toastError('Vui lòng tích chọn "Hiển thị & Sửa đổi Key" để thực hiện lưu thay đổi!')
    return
  }
  const keys = apiKeysInput.value.split('\n').map(k => k.trim()).filter(k => k)
  if (keys.length === 0) {
    toastError('Vui lòng nhập ít nhất một API key')
    return
  }
  await settings.setApiKeys(keys)
  success(`Đã lưu ${keys.length} API key`)
  showRawKeys.value = false // Tự động ẩn lại key sau khi lưu để bảo mật
}

function clearKeys() {
  settings.clearKeys()
  apiKeysInput.value = ''
  success('Đã xóa tất cả API key')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}
</script>
