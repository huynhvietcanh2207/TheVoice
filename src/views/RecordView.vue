<template>
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl lg:text-3xl font-black bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 bg-clip-text text-transparent">{{ $t('record.title') }}</h1>
      <p class="text-text-main font-medium text-sm mt-1.5 opacity-90">{{ $t('record.subtitle') }}</p>
    </div>

    <!-- Meeting name input -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-text-muted mb-2">{{ $t('record.meeting_name_label') }}</label>
      <input 
        v-model="meetingName" 
        type="text" 
        :placeholder="$t('record.meeting_name_placeholder')"
        class="w-full px-4 py-3 bg-navy-800/40 border border-navy-700/50 rounded-xl text-text-main text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/25 transition-all text-shadow-sm"
        :disabled="isRecording || isPaused"
      />
    </div>

    <!-- Tab switcher: Record / Upload / YouTube / Notes -->
    <div class="flex gap-1 p-1 bg-navy-800/40 rounded-xl mb-6 shadow-inner border border-navy-700/30">
      <button 
        v-for="tab in inputTabs" 
        :key="tab.key"
        @click="activeInputTab = tab.key"
        class="flex-1 px-4 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-transparent"
        :class="activeInputTab === tab.key 
          ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30' 
          : 'text-text-muted hover:text-text-main hover:bg-navy-800/50'"
        :disabled="isRecording || isPaused"
      >
        <span>{{ tab.icon }}</span>
        <span class="hidden sm:inline">{{ tab.label }}</span>
      </button>
    </div>

    <!-- ===== TAB: GHI ÂM ===== -->
    <div v-if="activeInputTab === 'record'" class="glass rounded-3xl p-8 lg:p-12 text-center">
      <!-- Waveform -->
      <div class="mb-8 h-24 flex items-center justify-center">
        <canvas 
          ref="waveformCanvas" 
          class="w-full h-full rounded-xl"
          :class="{ 'opacity-30': !isRecording || isPaused }"
        />
      </div>

      <!-- Timer -->
      <div class="text-5xl lg:text-6xl font-light text-text-main tracking-wider mb-8 font-mono tabular-nums">
        {{ formattedTime }}
      </div>

      <!-- REC button -->
      <div class="flex items-center justify-center gap-6 mb-8">
        <div class="relative">
          <div v-if="isRecording && !isPaused" class="absolute inset-0 rounded-full bg-red-500/30 animate-pulse-ring" />
          <div v-if="isRecording && !isPaused" class="absolute inset-0 rounded-full bg-red-500/20 animate-pulse-ring" style="animation-delay: 0.5s" />
          
          <button 
            @click="toggleRecording"
            class="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl"
            :class="isRecording 
              ? 'bg-red-500 hover:bg-red-400 shadow-red-500/30' 
              : 'bg-gradient-to-br from-accent-400 to-accent-600 hover:from-accent-300 hover:to-accent-500 shadow-accent-500/30'"
          >
            <svg v-if="!isRecording" class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <div v-else class="w-6 h-6 bg-white rounded-sm" />
          </button>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-center gap-4">
        <button 
          v-if="isRecording"
          @click="togglePause"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="isPaused 
            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20' 
            : 'bg-navy-800/40 text-text-main border border-navy-700/50 hover:bg-navy-800'"
        >
          <svg v-if="isPaused" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
          </svg>
          {{ isPaused ? $t('common.resume') : $t('common.pause') }}
        </button>

        <button 
          v-if="isRecording"
          @click="stopAndAnalyze"
          class="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 hover:from-accent-300 hover:to-accent-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-accent-500/25 transition-all hover:-translate-y-0.5"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ $t('record.btn_stop_analyze') }}
        </button>
      </div>

      <!-- Status text -->
      <p class="text-xs text-text-muted mt-6 font-medium">
        <span v-if="!isRecording">{{ $t('record.status_idle') }}</span>
        <span v-else-if="isPaused" class="text-amber-500 font-bold uppercase tracking-widest">{{ $t('record.status_paused') }}</span>
        <span v-else class="text-accent-500 font-bold">● {{ $t('record.status_recording') }}</span>
      </p>

      <!-- Pause Options Overlay -->
      <transition name="fade">
        <div v-if="isPaused" class="absolute inset-x-4 bottom-4 lg:bottom-10 lg:inset-x-10 p-6 glass-card rounded-3xl z-20 flex flex-col items-center gap-4 border-amber-500/30">
          <h3 class="text-amber-500 font-bold text-sm uppercase tracking-[0.2em]">{{ $t('record.pause_options_title') }}</h3>
          <div class="flex flex-wrap justify-center gap-3 w-full">
            <button 
              @click="togglePause"
              class="flex-1 min-w-[120px] py-3 bg-navy-800/80 hover:bg-navy-700 text-text-main text-sm font-bold rounded-xl transition-all border border-navy-700/50"
            >
              {{ $t('common.resume') }}
            </button>
            <button 
              @click="stopAndAnalyze"
              class="flex-1 min-w-[120px] py-3 bg-gradient-to-r from-accent-400 to-accent-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-accent-500/20"
            >
              {{ $t('common.finish_analyze') }}
            </button>
          </div>
          <button 
            @click="discardRecording"
            class="text-[10px] text-red-500/60 hover:text-red-500 font-bold uppercase tracking-wider transition-colors"
          >
            {{ $t('record.btn_discard') }}
          </button>
        </div>
      </transition>
    </div>

    <!-- ===== TAB: UPLOAD FILE ===== -->
    <div v-else-if="activeInputTab === 'upload'" class="glass rounded-3xl p-8 lg:p-12">
      <!-- Drag & Drop zone -->
      <div 
        class="border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer"
        :class="isDragging 
          ? 'border-accent-500 bg-accent-500/10' 
          : uploadedFile 
            ? 'border-accent-500/50 bg-accent-500/5' 
            : 'border-navy-700/50 hover:border-accent-500/30 hover:bg-navy-800/30'"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="handleDrop"
        @click="fileInput.click()"
      >
        <input 
          ref="fileInput" 
          type="file" 
          accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.flac,.aac"
          class="hidden" 
          @change="handleFileSelect"
        />

        <!-- Icon -->
        <div v-if="!uploadedFile" class="space-y-4">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-navy-800/10 flex items-center justify-center">
            <svg class="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div>
            <p class="text-text-main font-medium">{{ $t('record.upload_title') }}</p>
            <p class="text-text-muted text-sm mt-1">{{ $t('record.upload_subtitle') }}</p>
          </div>
          <p class="text-text-muted opacity-60 text-xs">{{ $t('record.upload_limit') }}</p>
        </div>

        <div v-else class="space-y-3">
          <div class="w-16 h-16 mx-auto rounded-2xl bg-accent-500/10 flex items-center justify-center">
            <svg class="w-8 h-8 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-text-main font-medium truncate">{{ uploadedFile.name }}</p>
          <p class="text-text-muted text-sm">{{ formatFileSize(uploadedFile.size) }}</p>
          <button @click.stop="clearUpload" class="text-xs text-red-500 hover:text-red-400 underline">{{ $t('common.select_other_file') }}</button>
        </div>
      </div>

      <!-- Analyze button -->
      <button 
        v-if="uploadedFile"
        @click="analyzeUploadedFile"
        :disabled="isUploading"
        class="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 disabled:from-navy-700 disabled:to-navy-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-accent-500/25 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0"
      >
        <svg v-if="!isUploading" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ isUploading ? $t('common.processing') : $t('common.analyze_with_ai') }}
      </button>
    </div>

    <!-- ===== TAB: YOUTUBE ===== -->
    <div v-else-if="activeInputTab === 'youtube'" class="glass rounded-3xl p-8 lg:p-12">
      <div class="space-y-6">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
          <svg class="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>

        <div class="text-center">
          <p class="text-text-main font-medium mb-1">{{ $t('record.yt_title') }}</p>
          <p class="text-text-muted text-sm">{{ $t('record.yt_subtitle') }}</p>
        </div>

        <div class="relative">
          <input 
            v-model="youtubeUrl"
            type="url"
            :placeholder="$t('record.yt_placeholder')"
            class="w-full px-4 py-3.5 pl-11 bg-navy-800/40 border border-navy-700/50 rounded-xl text-text-main text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/25 transition-all shadow-inner"
          />
          <svg class="w-4 h-4 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        </div>

        <div v-if="isValidYouTube" class="p-3 bg-navy-800/10 rounded-xl border border-navy-700/30 text-center">
          <div class="flex items-center justify-center gap-2 text-xs text-accent-500 font-bold">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {{ $t('record.yt_valid') }}
          </div>
        </div>

        <button 
          @click="analyzeYouTube"
          :disabled="!isValidYouTube || isUploading"
          class="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 disabled:from-navy-700 disabled:to-navy-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-accent-500/25 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:shadow-none"
        >
          <svg v-if="!isUploading" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ isUploading ? $t('common.processing') : $t('record.btn_analyze_yt') }}
        </button>

        <p class="text-xs text-text-muted text-center italic opacity-60">{{ $t('record.yt_warning') }}</p>
      </div>
    </div>

    <!-- ===== TAB: GHI CHÚ ===== -->
    <div v-else-if="activeInputTab === 'notes'" class="glass rounded-3xl p-8 lg:p-10">
      <div class="space-y-4">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-500">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <div>
            <p class="text-text-main font-bold">{{ $t('record.notes_title') }}</p>
            <p class="text-text-muted text-xs">{{ $t('record.notes_subtitle') }}</p>
          </div>
        </div>

        <textarea 
          v-model="quickNoteContent"
          :placeholder="$t('record.notes_placeholder')"
          rows="10"
          class="w-full px-5 py-4 bg-navy-800/30 border border-navy-700/50 rounded-2xl text-sm text-text-main placeholder:text-text-muted/40 focus:outline-none focus:border-accent-500/30 transition-all leading-relaxed resize-none shadow-inner"
        ></textarea>

        <button 
          @click="saveQuickNote"
          :disabled="!quickNoteContent.trim()"
          class="w-full py-3.5 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 disabled:from-navy-800 disabled:to-navy-800 disabled:text-text-muted text-white font-bold rounded-xl shadow-lg shadow-accent-500/20 transition-all active:scale-[0.98]"
        >
          {{ $t('record.notes_btn_save') }}
        </button>
      </div>
    </div>

    <!-- Permission error -->
    <div v-if="permissionError" class="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500 font-medium">
      <p class="font-bold mb-1">{{ $t('record.error_mic_title') }}</p>
      <p class="opacity-80">{{ $t('record.error_mic_desc') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, computed } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { useMeetingsStore } from '@/stores/meetings'
import { useSettingsStore } from '@/stores/settings'
import { useToast } from '@/composables/useToast'
import { isYouTubeUrl } from '@/lib/gemini'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const meetingsStore = useMeetingsStore()
const settingsStore = useSettingsStore()
const { error: toastError, info: toastInfo, success: toastSuccess } = useToast()
const { t } = useI18n()

// Shared
const meetingName = ref('')
const activeInputTab = ref('record')
const isUploading = ref(false)
const quickNoteContent = ref('')

const inputTabs = computed(() => [
  { key: 'record', icon: '🎤', label: t('record.tab_record') },
  { key: 'upload', icon: '📁', label: t('record.tab_upload') },
  { key: 'youtube', icon: '▶', label: t('record.tab_youtube') },
  { key: 'notes', icon: '📝', label: t('record.tab_notes') }
])

// ===== RECORD =====
const isRecording = ref(false)
const isPaused = ref(false)
const permissionError = ref(false)
const elapsedSeconds = ref(0)
const waveformCanvas = ref(null)

let mediaRecorder = null
let audioChunks = []
let timerInterval = null
let audioContext = null
let analyser = null
let animationFrame = null
let stream = null

const formattedTime = computed(() => {
  const h = Math.floor(elapsedSeconds.value / 3600)
  const m = Math.floor((elapsedSeconds.value % 3600) / 60)
  const s = elapsedSeconds.value % 60
  if (h > 0) return `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
})

async function toggleRecording() {
  if (isRecording.value) {
    // Thay vì dừng hẳn, ta chuyển sang trạng thái pause để hiện menu lựa chọn (Phân tích/Tiếp tục/Hủy)
    if (!isPaused.value) {
      togglePause()
    }
  } else {
    await startRecording()
  }
}

async function startRecording() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    permissionError.value = false
    
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    const source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)
    
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    audioChunks = []
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data)
    }
    
    mediaRecorder.start(1000)
    isRecording.value = true
    isPaused.value = false
    elapsedSeconds.value = 0
    
    startTimer()
    drawWaveform()
  } catch (err) {
    console.error('Microphone error:', err)
    permissionError.value = true
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  isRecording.value = false
  isPaused.value = false
  stopTimer()
  stopWaveform()
  
  if (stream) {
    stream.getTracks().forEach(t => t.stop())
  }
  if (audioContext) {
    audioContext.close()
  }
}

function togglePause() {
  if (!mediaRecorder) return
  if (isPaused.value) {
    mediaRecorder.resume()
    isPaused.value = false
    startTimer()
    drawWaveform()
  } else {
    mediaRecorder.pause()
    isPaused.value = true
    stopTimer()
    if (animationFrame) cancelAnimationFrame(animationFrame)
  }
}

async function stopAndAnalyze() {
  if (!settingsStore.hasApiKey) {
    toastError(t('common.error_no_api_key'))
    router.push('/settings')
    return
  }

  return new Promise((resolve) => {
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
      
      const meeting = {
        id,
        name: meetingName.value || `${t('common.meeting')} ${new Date().toLocaleDateString('vi-VN')}`,
        date: new Date().toISOString(),
        duration: elapsedSeconds.value,
        audioBlob,
        status: 'pending',
        source: 'record'
      }

      await meetingsStore.addMeeting(meeting)
      toastInfo(t('record.info_saved'))
      router.push(`/processing/${id}`)
      resolve()
    }
    
    stopRecording()
  })
}

async function saveQuickNote() {
  if (!quickNoteContent.value.trim()) return
  
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
  const meeting = {
    id,
    name: meetingName.value || `${t('common.note')} ${new Date().toLocaleDateString('vi-VN')}`,
    date: new Date().toISOString(),
    duration: 0,
    transcript: quickNoteContent.value,
    status: 'analyzed',
    source: 'notes',
    summary: t('record.notes_default_summary'),
    key_points: [t('record.notes_default_points')],
    decisions: [],
    action_items: []
  }

  await meetingsStore.addMeeting(meeting)
  toastSuccess(t('record.notes_save_success'))
  router.push(`/meeting/${id}`)
}

function getAudioDuration(file) {
  return new Promise((resolve) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    audio.src = url
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(Math.round(audio.duration))
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(0)
    }
  })
}

function startTimer() {
  timerInterval = setInterval(() => {
    elapsedSeconds.value++
  }, 1000)
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function drawWaveform() {
  if (!waveformCanvas.value || !analyser) return
  
  const canvas = waveformCanvas.value
  const ctx = canvas.getContext('2d')
  canvas.width = canvas.offsetWidth * 2
  canvas.height = canvas.offsetHeight * 2
  
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  
  function draw() {
    animationFrame = requestAnimationFrame(draw)
    analyser.getByteFrequencyData(dataArray)
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const barWidth = (canvas.width / bufferLength) * 2
    const centerY = canvas.height / 2
    
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * centerY * 0.9
      const x = i * barWidth
      
      const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight)
      gradient.addColorStop(0, '#FD5A55') // Coral
      gradient.addColorStop(0.5, '#E02F75') // Pink
      gradient.addColorStop(1, '#66009E') // Purple
      
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(x, centerY - barHeight, barWidth - 2, barHeight * 2, 2)
      ctx.fill()
    }
  }
  
  draw()
}

function stopWaveform() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}

// ===== UPLOAD FILE =====
const uploadedFile = ref(null)
const isDragging = ref(false)
const fileInput = ref(null)
const MAX_FILE_SIZE = 2000 * 1024 * 1024 // 2GB

function handleDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) validateAndSetFile(file)
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) validateAndSetFile(file)
}

function validateAndSetFile(file) {
  if (!file.type.startsWith('audio/') && !['mp3','wav','m4a','ogg','webm','flac','aac'].includes(file.name.split('.').pop()?.toLowerCase())) {
    toastError(t('record.error_invalid_file'))
    return
  }
  if (file.size > MAX_FILE_SIZE) {
    toastError(t('record.error_file_too_large', { size: '2GB' }))
    return
  }
  uploadedFile.value = file
}

function clearUpload() {
  uploadedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function analyzeUploadedFile() {
  if (!settingsStore.hasApiKey) {
    toastError(t('common.error_no_api_key'))
    router.push('/settings')
    return
  }
  if (!uploadedFile.value) return

  isUploading.value = true
  try {
    const duration = await getAudioDuration(uploadedFile.value)
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
    
    const meeting = {
      id,
      name: meetingName.value || uploadedFile.value.name.replace(/\.[^.]+$/, ''),
      date: new Date().toISOString(),
      duration,
      audioBlob: uploadedFile.value,
      status: 'pending',
      source: 'upload',
      fileName: uploadedFile.value.name,
      fileSize: uploadedFile.value.size
    }

    await meetingsStore.addMeeting(meeting)
    toastSuccess(t('record.upload_success'))
    router.push(`/processing/${id}`)
  } catch (err) {
    toastError(t('record.error_processing_file') + err.message)
  } finally {
    isUploading.value = false
  }
}

// ===== YOUTUBE =====
const youtubeUrl = ref('')

const isValidYouTube = computed(() => isYouTubeUrl(youtubeUrl.value))

async function analyzeYouTube() {
  if (!settingsStore.hasApiKey) {
    toastError(t('common.error_no_api_key'))
    router.push('/settings')
    return
  }
  if (!isValidYouTube.value) return

  isUploading.value = true
  try {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
    
    const meeting = {
      id,
      name: meetingName.value || `YouTube - ${new Date().toLocaleDateString('vi-VN')}`,
      date: new Date().toISOString(),
      duration: 0,
      youtubeUrl: youtubeUrl.value,
      status: 'pending',
      source: 'youtube'
    }

    await meetingsStore.addMeeting(meeting)
    toastSuccess(t('record.yt_success'))
    router.push(`/processing/${id}`)
  } catch (err) {
    toastError(t('common.error') + err.message)
  } finally {
    isUploading.value = false
  }
}

function discardRecording() {
  if (window.confirm(t('common.confirm_discard'))) {
    stopRecording()
    elapsedSeconds.value = 0
    audioChunks = []
    toastInfo(t('dashboard.delete_success'))
  }
}

onBeforeRouteLeave((to, from, next) => {
  if (isRecording.value) {
    const answer = window.confirm(t('record.confirm_leave'))
    if (answer) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})

onUnmounted(() => {
  stopRecording()
  stopTimer()
  stopWaveform()
})
</script>

<style scoped>
</style>
