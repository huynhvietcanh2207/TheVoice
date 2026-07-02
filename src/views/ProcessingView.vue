<template>
  <div class="max-w-xl mx-auto py-12">
    <div class="glass rounded-3xl p-8 lg:p-12 text-center">
      <!-- Circular Progress Ring -->
      <div class="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
        <!-- SVG Progress Circle -->
        <svg class="w-full h-full transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r="60"
            class="stroke-navy-800 fill-none"
            stroke-width="6"
          />
          <circle
            cx="72"
            cy="72"
            r="60"
            class="stroke-accent-500 fill-none transition-all duration-300 ease-out"
            stroke-width="6"
            stroke-dasharray="376.99"
            :stroke-dashoffset="dashOffset"
            stroke-linecap="round"
          />
        </svg>
        
        <!-- Inside Text (Percent) -->
        <div class="absolute flex flex-col items-center">
          <span class="text-3xl font-black text-text-main tracking-tighter tabular-nums">{{ currentPercent }}%</span>
          <span class="text-[9px] uppercase tracking-widest text-text-muted font-bold mt-0.5">{{ $t('common.processing') }}</span>
        </div>
      </div>

      <!-- Elapsed Timer -->
      <div v-if="!hasError" class="text-xs text-text-muted mb-6 flex items-center justify-center gap-1 font-mono">
        <span>⏱ {{ elapsedSeconds }} giây</span>
      </div>

      <h2 class="text-xl font-bold text-text-main mb-1">Đang phân tích cuộc họp</h2>
      <p class="text-sm text-accent-500 font-semibold mb-8 animate-pulse">{{ currentMessage }}</p>

      <!-- Steps -->
      <div class="space-y-4 text-left max-w-sm mx-auto mb-10">
        <div 
          v-for="(step, i) in steps" 
          :key="i"
          class="flex items-center gap-3 transition-all duration-500"
          :class="{ 'opacity-30': i > currentStep && !hasError }"
        >
          <!-- Icon -->
          <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all"
            :class="{
              'bg-accent-500/10': i < currentStep,
              'bg-accent-500/10 ring-2 ring-accent-500/30': i === currentStep && !hasError,
              'bg-red-500/10 ring-2 ring-red-500/30': i === currentStep && hasError,
              'bg-navy-800/40': i > currentStep
            }">
            <!-- Done check -->
            <svg v-if="i < currentStep" class="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <!-- Loading spinner -->
            <svg v-else-if="i === currentStep && !hasError" class="w-4 h-4 text-accent-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <!-- Error -->
            <svg v-else-if="i === currentStep && hasError" class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <!-- Pending dot -->
            <div v-else class="w-2 h-2 rounded-full bg-text-muted opacity-30" />
          </div>

          <span class="text-sm font-bold"
            :class="{
              'text-accent-500': i < currentStep,
              'text-text-main': i === currentStep,
              'text-text-muted opacity-50': i > currentStep
            }">
            {{ step }}
          </span>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="hasError" class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500 text-left">
        <p class="font-bold mb-1">Lỗi phân tích</p>
        <p class="opacity-80">{{ errorMessage }}</p>
        <div class="flex gap-3 mt-4">
          <button @click="retryAnalysis" class="px-4 py-2 bg-accent-500 hover:bg-accent-400 text-white text-sm font-bold rounded-lg transition-colors shadow-lg shadow-accent-500/20">
            Thử lại
          </button>
          <router-link to="/" class="px-4 py-2 text-text-muted hover:text-text-main text-sm font-medium rounded-lg hover:bg-navy-800/40 transition-colors">
            Về Trang chủ
          </router-link>
        </div>
      </div>

      <!-- Cancel button -->
      <button 
        v-if="!hasError"
        @click="cancelAnalysis"
        class="mt-8 text-sm text-text-muted hover:text-red-500 transition-colors flex items-center justify-center gap-2 mx-auto uppercase tracking-widest font-bold opacity-60 hover:opacity-100"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        {{ $t('common.cancel') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useMeetingsStore } from '@/stores/meetings'
import { useSettingsStore } from '@/stores/settings'
import { analyzeMeeting } from '@/lib/gemini'

const route = useRoute()
const router = useRouter()
const meetingsStore = useMeetingsStore()
const settingsStore = useSettingsStore()
const { t } = useI18n()

const steps = [
  'Đang chuẩn bị audio...',
  'Đang upload audio...',
  'Hệ thống đang transcribe và phân tích...',
  'Đang xử lý kết quả...',
  'Hoàn tất!'
]

const currentPercent = ref(0)
const currentMessage = ref('Đang chuẩn bị...')
const elapsedSeconds = ref(0)
const hasError = ref(false)
const errorMessage = ref('')
let timerInterval = null

// Circle radius is 60, circumference = 2 * PI * 60 = 376.99
const strokeDasharray = 376.99
const dashOffset = computed(() => {
  return strokeDasharray - (strokeDasharray * currentPercent.value) / 100
})

const currentStep = computed(() => {
  const p = currentPercent.value
  if (p < 20) return 0
  if (p < 45) return 1
  if (p < 90) return 2
  if (p < 95) return 3
  return 4
})

function onProgress(percent, msg) {
  currentPercent.value = percent
  if (msg) currentMessage.value = msg
}

async function startAnalysis() {
  hasError.value = false
  errorMessage.value = ''
  currentPercent.value = 0
  currentMessage.value = 'Đang khởi tạo...'
  elapsedSeconds.value = 0

  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    elapsedSeconds.value++
  }, 1000)

  try {
    const meeting = await meetingsStore.loadMeeting(route.params.id)
    if (!meeting) throw new Error('Không tìm thấy buổi họp')
    
    // Determine source: YouTube URL or audio blob
    let source
    if (meeting.source === 'youtube' && meeting.youtubeUrl) {
      source = meeting.youtubeUrl
    } else if (meeting.audioBlob) {
      source = meeting.audioBlob
    } else {
      throw new Error('Không tìm thấy file audio hoặc link YouTube')
    }

    const result = await analyzeMeeting(
      source,
      settingsStore.currentApiKey,
      settingsStore.modelName,
      onProgress,
      settingsStore.allApiKeys
    )

    currentPercent.value = 100
    currentMessage.value = 'Hoàn tất!'

    await meetingsStore.saveAnalysis(meeting.id, result)
    
    // Brief delay to show completion
    await new Promise(r => setTimeout(r, 800))
    router.push(`/meeting/${meeting.id}`)
  } catch (err) {
    console.error('Phân tích thất bại:', err)
    hasError.value = true
    errorMessage.value = err.message || 'Đã xảy ra lỗi không xác định'
  } finally {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }
}

function retryAnalysis() {
  startAnalysis()
}

function cancelAnalysis() {
  if (confirm(t('common.confirm_discard'))) {
    const id = route.params.id
    meetingsStore.removeMeeting(id)
    router.push('/')
  }
}

onMounted(() => {
  startAnalysis()
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>
