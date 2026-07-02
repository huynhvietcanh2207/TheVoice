import { createI18n } from 'vue-i18n'
import vi from './locales/vi.json'
import en from './locales/en.json'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('app_language') || 'vi',
  fallbackLocale: 'vi',
  messages: {
    vi,
    en
  }
})

export default i18n
