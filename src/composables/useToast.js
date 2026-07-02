import { reactive } from 'vue'

const state = reactive({
  toasts: []
})

let toastId = 0

export function useToast() {
  function toast({ message, type = 'info', duration = 3000 }) {
    const id = ++toastId
    state.toasts.push({ id, message, type })
    setTimeout(() => {
      const index = state.toasts.findIndex(t => t.id === id)
      if (index !== -1) state.toasts.splice(index, 1)
    }, duration)
  }

  function success(message) { toast({ message, type: 'success' }) }
  function error(message) { toast({ message, type: 'error' }) }
  function info(message) { toast({ message, type: 'info' }) }

  return { toasts: state.toasts, toast, success, error, info }
}
