<template>
  <div>
    <!-- Header -->
    <div class="mb-8 font-outfit flex justify-between items-start">
      <div>
        <h1 class="text-2xl lg:text-3xl font-black bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 bg-clip-text text-transparent tracking-tight">{{ $t('dashboard.title') }}</h1>
        <p class="text-text-main font-medium text-sm mt-1.5 opacity-90">{{ $t('dashboard.subtitle') }}</p>
      </div>

      <!-- Dynamic Greeting (Top Right) -->
      <div class="text-right">
        <div class="text-[8px] sm:text-[10px] uppercase tracking-widest text-text-muted font-bold mb-0.5 leading-none">{{ currentDate }}</div>
        <div class="text-[12px] sm:text-sm font-black bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent italic leading-tight">
          {{ $t(`dashboard.greeting_${greetingTime}`) }}!
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="mb-6 relative group">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg class="w-5 h-5 text-text-muted group-focus-within:text-accent-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
      <input 
        v-model="searchQuery" 
        type="text" 
        :placeholder="$t('dashboard.search_placeholder')" 
        class="w-full pl-11 pr-4 py-3.5 bg-navy-800/40 border border-navy-700/50 rounded-2xl text-text-main text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/10 transition-all shadow-inner"
      />
      <button 
        v-if="searchQuery" 
        @click="searchQuery = ''"
        class="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-main"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="glass-card rounded-2xl p-5">
        <div class="flex items-center gap-4">
          <div class="skeleton w-12 h-12 rounded-xl shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="skeleton h-4 w-1/3" />
            <div class="skeleton h-3 w-1/4" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="meetings.length === 0" class="text-center py-20 bg-navy-900/20 rounded-3xl border border-dashed border-navy-800">
      <div class="w-20 h-20 mx-auto mb-6 rounded-3xl bg-navy-800/50 flex items-center justify-center animate-float">
        <svg class="w-10 h-10 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-text-main mb-2">{{ $t('dashboard.empty_title') }}</h3>
      <p class="text-text-muted text-sm mb-8">{{ $t('dashboard.empty_subtitle') }}</p>
      <router-link 
        to="/record" 
        class="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-accent-600 to-accent-400 hover:from-accent-500 hover:to-accent-300 text-white font-bold rounded-2xl transition-all shadow-xl shadow-accent-500/20 active:scale-95"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {{ $t('dashboard.start_now') }}
      </router-link>
    </div>

    <!-- Meeting list -->
    <div v-else class="space-y-4 pb-32">
      <div v-if="searchQuery && filteredMeetings.length === 0" class="text-center py-12 text-text-muted">
        <p>{{ $t('dashboard.no_results') }}: <span class="text-text-main">"{{ searchQuery }}"</span></p>
      </div>
      
      <div 
        v-for="meeting in filteredMeetings" 
        :key="meeting.id"
        class="glass-card rounded-2xl p-4 sm:p-5 cursor-pointer group relative transition-all duration-300 border-navy-700/30 hover:border-navy-600/50 hover:bg-navy-800/40"
        :class="{ 'border-accent-500/40 ring-1 ring-accent-500/10 bg-accent-500/[0.02]' : meeting.isPinned }"
        :style="{ zIndex: openMenuId === meeting.id ? 50 : 1 }"
        @click="goToMeeting(meeting)"
      >
        <div class="flex items-center gap-4">
          <!-- Icon -->
          <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-105 shadow-lg"
            :class="meeting.status === 'analyzed' ? 'bg-gradient-to-br from-accent-500/20 to-navy-800 text-accent-500' : 'bg-navy-800 text-text-muted'">
            
            <template v-if="meeting.source === 'record'">
              <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            </template>
            <template v-else-if="meeting.source === 'upload'">
              <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32a1.5 1.5 0 1 1-2.121-2.121l10.94-10.94" />
              </svg>
            </template>
            <template v-else-if="meeting.source === 'youtube'">
              <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM10 14.5v-5l4.5 2.5-4.5 2.5z"/>
              </svg>
            </template>
            <template v-else-if="meeting.source === 'notes'">
              <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </template>
            <template v-else>
              <svg class="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </template>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <h3 class="text-sm sm:text-base font-bold text-text-main truncate transition-colors group-hover:text-accent-400">
              {{ meeting.name || $t('dashboard.no_name_meeting') }}
            </h3>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] sm:text-xs text-text-muted font-medium italic">
              <span>{{ formatDate(meeting.date) }}</span>
              <span v-if="meeting.duration > 0" class="not-italic text-text-muted opacity-50">•</span>
              <span v-if="meeting.duration > 0">{{ formatDuration(meeting.duration) }}</span>
              <span v-if="meeting.source === 'youtube'" class="text-red-500/80 uppercase tracking-tighter font-black font-mono text-[9px] sm:text-[10px]">YouTube</span>
              <span v-else-if="meeting.source === 'upload'" class="text-accent-500/80 uppercase tracking-tighter font-black font-mono text-[9px] sm:text-[10px]">Upload</span>
              <span v-else-if="meeting.source === 'notes'" class="text-emerald-500/80 uppercase tracking-tighter font-black font-mono text-[9px] sm:text-[10px]">Note</span>
            </div>
          </div>

          <!-- Actions & Status Area -->
          <div class="shrink-0 flex items-center gap-1 sm:gap-2">
            <div class="flex items-center gap-2">
              <div class="flex items-center bg-navy-800/40 px-2 py-1 sm:px-3 sm:py-1.5 rounded-2xl border border-navy-800/50">
                <span 
                  v-if="meeting.status === 'analyzed'"
                  class="text-[9px] sm:text-[11px] font-bold text-emerald-500 uppercase tracking-wide"
                >
                  {{ $t('dashboard.status_done') }}
                </span>
                <span 
                  v-else
                  class="text-[9px] sm:text-[11px] font-bold text-amber-500 uppercase tracking-wide animate-pulse"
                >
                  {{ $t('dashboard.status_pending') }}
                </span>
              </div>

              <!-- Star Pin Icon (Always visible button for quick toggle) -->
              <button 
                @click.stop="handleTogglePin(meeting)"
                class="p-2 -mr-1 rounded-full transition-all duration-300 active:scale-125"
                :title="meeting.isPinned ? $t('dashboard.unpin') : $t('dashboard.pin')"
              >
                <svg 
                  class="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300" 
                  :class="meeting.isPinned ? 'text-accent-500 fill-accent-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse-once' : 'text-text-muted hover:text-text-main hover:scale-110'" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </button>
            </div>
            
            <!-- Three-dot menu button -->
            <div class="relative">
              <button 
                @click.stop="toggleMenu(meeting.id)"
                class="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-navy-800 transition-all active:scale-90"
              >
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <transition name="fade-down">
                <div 
                  v-if="openMenuId === meeting.id"
                  class="absolute right-0 top-full mt-2 w-44 bg-navy-900 border border-navy-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden py-1.5"
                  @click.stop
                >
                  <button 
                    @click.stop="handleTogglePin(meeting); openMenuId = null"
                    class="w-full flex items-center gap-3 px-4 py-3 text-xs text-left text-text-main hover:bg-navy-800 transition-colors"
                  >
                    <svg class="w-4 h-4" :fill="meeting.isPinned ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                    {{ meeting.isPinned ? $t('dashboard.unpin') : $t('dashboard.pin') }}
                  </button>
                  <button 
                    @click.stop="confirmRename(meeting)" 
                    class="w-full flex items-center gap-3 px-4 py-3 text-xs text-left text-text-main hover:bg-navy-800 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                    </svg>
                    {{ $t('common.rename') }}
                  </button>
                  <div class="h-px bg-navy-800 mx-2 my-1" />
                  <button 
                    @click.stop="confirmDelete(meeting)"
                    class="w-full flex items-center gap-3 px-4 py-3 text-xs text-left text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    {{ $t('common.delete') }}
                  </button>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <!-- Delete Modal -->
      <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" @click="deleteTarget = null" />
        <div class="relative glass rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-navy-700/50">
          <h3 class="text-xl font-bold text-text-main mb-2">{{ $t('dashboard.delete_confirm_title') }}</h3>
          <p class="text-sm text-text-muted mb-8 leading-relaxed">{{ $t('dashboard.delete_confirm_desc', { name: deleteTarget.name }) }}</p>
          <div class="flex flex-col sm:flex-row gap-3">
            <button @click="deleteTarget = null" class="flex-1 px-4 py-3 text-sm font-bold text-text-muted hover:text-text-main rounded-2xl bg-navy-800 hover:bg-navy-700 transition-all">
              {{ $t('common.cancel') }}
            </button>
            <button @click="doDelete" class="flex-1 px-4 py-3 text-sm font-bold bg-red-500 text-white rounded-2xl hover:bg-red-400 shadow-lg shadow-red-500/20 transition-all">
              {{ $t('common.delete') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Rename Modal -->
      <div v-if="renameTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" @click="renameTarget = null" />
        <div class="relative glass rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-navy-700/50">
          <h3 class="text-xl font-bold text-text-main mb-4 italic text-center">{{ $t('dashboard.rename_modal_title') }}</h3>
          <div class="relative mb-8">
            <input 
              v-model="renameValue"
              @keydown.enter="doRename"
              type="text"
              class="w-full px-5 py-4 bg-navy-800/60 border border-navy-700/50 rounded-2xl text-text-main text-sm focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 transition-all placeholder:text-text-muted"
              :placeholder="$t('dashboard.rename_placeholder')"
              autoFocus
            />
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <button @click="renameTarget = null" class="flex-1 px-4 py-3 text-sm font-bold text-text-muted hover:text-text-main rounded-2xl bg-navy-800 hover:bg-navy-700 transition-all">
              {{ $t('common.cancel') }}
            </button>
            <button @click="doRename" class="flex-1 px-4 py-3 text-sm font-bold bg-accent-500 text-white rounded-2xl hover:bg-accent-400 shadow-lg shadow-accent-500/20 transition-all">
              {{ $t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMeetingsStore } from '@/stores/meetings'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const store = useMeetingsStore()
const { success } = useToast()
const { t } = useI18n()

const meetings = computed(() => store.meetings)
const loading = ref(true)
const deleteTarget = ref(null)
const renameTarget = ref(null)
const renameValue = ref('')
const openMenuId = ref(null)
const searchQuery = ref('')

const greetingTime = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
})

const currentDate = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('vi-VN', { 
    weekday: 'long', 
    day: '2-digit', 
    month: '2-digit' 
  }).toUpperCase()
})

const filteredMeetings = computed(() => {
  let list = [...meetings.value]
  
  // Sort: Pinned first, then by date
  list.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.date) - new Date(a.date)
  })

  if (!searchQuery.value) return list
  
  const query = searchQuery.value.toLowerCase()
  return list.filter(m => {
    // Check various fields to match query
    const matchName = m.name?.toLowerCase().includes(query)
    const matchSummary = m.summary?.toLowerCase().includes(query)
    const matchTranscript = m.transcript?.toLowerCase().includes(query)
    const matchDecisions = m.decisions?.some(d => d.toLowerCase().includes(query))
    const matchKeyPoints = m.key_points?.some(k => k.toLowerCase().includes(query))
    const matchActions = m.action_items?.some(a => a.task.toLowerCase().includes(query) || a.owner?.toLowerCase().includes(query))
    const matchTags = m.tags?.some(t => t.toLowerCase().includes(query))
    const matchNotes = m.notes?.toLowerCase().includes(query)
    
    return matchName || matchSummary || matchTranscript || matchDecisions || matchKeyPoints || matchActions || matchTags || matchNotes
  })
})

onMounted(async () => {
  await store.loadMeetings()
  loading.value = false
  window.addEventListener('click', closeAllMenus)
})

import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('click', closeAllMenus)
})

function closeAllMenus() {
  openMenuId.value = null
}

function toggleMenu(id) {
  if (openMenuId.value === id) {
    openMenuId.value = null
  } else {
    openMenuId.value = id
  }
}

function goToMeeting(meeting) {
  if (meeting.status === 'analyzed') {
    router.push(`/meeting/${meeting.id}`)
  } else {
    router.push(`/processing/${meeting.id}`)
  }
}

function confirmDelete(meeting) {
  deleteTarget.value = meeting
  openMenuId.value = null
}

function confirmRename(meeting) {
  renameTarget.value = meeting
  renameValue.value = meeting.name || ''
  openMenuId.value = null
}

async function doRename() {
  if (!renameTarget.value || !renameValue.value.trim()) return
  await store.updateMeetingData(renameTarget.value.id, { name: renameValue.value.trim() })
  renameTarget.value = null
  success(t('dashboard.rename_success'))
}

async function handleTogglePin(meeting) {
  const isNowPinned = !meeting.isPinned
  // Optimistic Toast: Show immediately
  if (isNowPinned) {
    success(t('dashboard.pin_success'))
  } else {
    success(t('dashboard.unpin_success'))
  }
  
  await store.togglePin(meeting.id)
}

async function doDelete() {
  if (!deleteTarget.value) return
  await store.removeMeeting(deleteTarget.value.id)
  deleteTarget.value = null
  success(t('dashboard.delete_success'))
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', { 
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  })
}

function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.fade-down-enter-active,
.fade-down-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-down-enter-from,
.fade-down-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>
