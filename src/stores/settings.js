import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

const DEFAULT_MODEL = 'gemini-3.5-flash'

export const AVAILABLE_MODELS = [
  { value: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash (Recommended)' },
  { value: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash-Lite (Low Latency)' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-2.5-flash-preview-native-audio-dialog', label: 'Gemini 2.5 Flash Native Audio Dialog' },
  { value: 'gemini-3-flash-live', label: 'Gemini 3 Flash Live' },
  { value: 'gemini-3.5-live-translate-preview', label: 'Gemini 3.5 Live Translate' },
]

// DÁN CÁC API KEYS CÔNG KHAI CỦA BẠN VÀO ĐÂY ĐỂ NGƯỜI KHÁC CÓ THỂ DÙNG LUÔN
// Ví dụ: const PUBLIC_API_KEYS = ['key1', 'key2', 'key3']
const PUBLIC_API_KEYS = []

export const useSettingsStore = defineStore('settings', () => {
  const apiKeys = ref(JSON.parse(localStorage.getItem('gemini_api_keys') || '[]'))
  const currentKeyIndex = ref(parseInt(localStorage.getItem('gemini_current_key_index') || '0'))
  const modelName = ref(localStorage.getItem('gemini_model') || DEFAULT_MODEL)
  const language = ref(localStorage.getItem('app_language') || 'vi')
  const theme = ref(localStorage.getItem('app_theme') || 'system')

  const hasApiKey = computed(() => apiKeys.value.length > 0 || PUBLIC_API_KEYS.length > 0)
  const totalAvailableKeys = computed(() => {
    return apiKeys.value.length > 0 ? apiKeys.value.length : PUBLIC_API_KEYS.length
  })

  const allApiKeys = computed(() => {
    if (apiKeys.value.length > 0) return apiKeys.value
    return PUBLIC_API_KEYS
  })

  const currentApiKey = computed(() => {
    // Ưu tiên các key người dùng tự nhập trong Cài đặt (localStorage)
    if (apiKeys.value.length > 0) {
      const idx = currentKeyIndex.value % apiKeys.value.length
      return apiKeys.value[idx]
    }

    // Nếu không có key cá nhân, dùng danh sách key công khai bên dưới
    if (PUBLIC_API_KEYS.length > 0) {
      const idx = currentKeyIndex.value % PUBLIC_API_KEYS.length
      return PUBLIC_API_KEYS[idx]
    }

    return ''
  })

  async function loadConfigFromDb() {
    if (!isSupabaseConfigured || !supabase) return
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
      if (error) throw error

      if (data) {
        const keysRow = data.find(r => r.key === 'gemini_api_keys')
        if (keysRow) {
          apiKeys.value = JSON.parse(keysRow.value)
        }
        const modelRow = data.find(r => r.key === 'gemini_model')
        if (modelRow) {
          modelName.value = modelRow.value
        }
      }
    } catch (err) {
      console.warn('Could not load system_config from Supabase (checking if table exists...):', err)
    }
  }

  async function setApiKeys(keys) {
    const cleaned = keys.filter(k => k && k.trim())
    apiKeys.value = cleaned
    localStorage.setItem('gemini_api_keys', JSON.stringify(cleaned))
    if (currentKeyIndex.value >= cleaned.length) {
      currentKeyIndex.value = 0
      localStorage.setItem('gemini_current_key_index', '0')
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('system_config')
          .upsert({ key: 'gemini_api_keys', value: JSON.stringify(cleaned) })
        if (error) throw error
      } catch (err) {
        console.error('Error saving api keys to Supabase:', err)
      }
    }
  }

  function rotateKey() {
    const totalPersonalKeys = apiKeys.value.length
    const totalPublicKeys = PUBLIC_API_KEYS.length

    if (totalPersonalKeys > 1) {
      currentKeyIndex.value = (currentKeyIndex.value + 1) % totalPersonalKeys
    } else if (totalPersonalKeys === 0 && totalPublicKeys > 1) {
      currentKeyIndex.value = (currentKeyIndex.value + 1) % totalPublicKeys
    } else {
      return false
    }

    localStorage.setItem('gemini_current_key_index', currentKeyIndex.value.toString())
    return true
  }

  async function setModel(name) {
    modelName.value = name
    localStorage.setItem('gemini_model', name)

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('system_config')
          .upsert({ key: 'gemini_model', value: name })
        if (error) throw error
      } catch (err) {
        console.error('Error saving model to Supabase:', err)
      }
    }
  }

  function setLanguage(lang) {
    language.value = lang
    localStorage.setItem('app_language', lang)
  }

  function setTheme(newTheme) {
    theme.value = newTheme
    localStorage.setItem('app_theme', newTheme)
  }

  async function clearKeys() {
    apiKeys.value = []
    currentKeyIndex.value = 0
    localStorage.removeItem('gemini_api_keys')
    localStorage.removeItem('gemini_current_key_index')

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('system_config')
          .delete()
          .eq('key', 'gemini_api_keys')
        if (error) throw error
      } catch (err) {
        console.error('Error deleting api keys from Supabase:', err)
      }
    }
  }

  return {
    apiKeys, modelName, currentKeyIndex, language, theme,
    hasApiKey, currentApiKey, allApiKeys, loadConfigFromDb,
    setApiKeys, rotateKey, setModel, setLanguage, setTheme, clearKeys
  }
})
