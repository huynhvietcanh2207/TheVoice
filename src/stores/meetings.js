import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAllMeetings, getMeeting, saveMeeting, deleteMeeting, updateMeeting } from '@/lib/db'

export const useMeetingsStore = defineStore('meetings', () => {
  const meetings = ref([])
  const loading = ref(false)
  const currentMeeting = ref(null)

  async function loadMeetings() {
    loading.value = true
    try {
      meetings.value = await getAllMeetings()
    } finally {
      loading.value = false
    }
  }

  async function loadMeeting(id) {
    loading.value = true
    try {
      currentMeeting.value = await getMeeting(id)
      return currentMeeting.value
    } finally {
      loading.value = false
    }
  }

  async function addMeeting(data) {
    const meeting = await saveMeeting(data)
    await loadMeetings()
    return meeting
  }

  async function removeMeeting(id) {
    await deleteMeeting(id)
    await loadMeetings()
  }

  async function saveAnalysis(id, analysis) {
    const updated = await updateMeeting(id, {
      ...analysis,
      status: 'analyzed'
    })
    currentMeeting.value = updated
    await loadMeetings()
    return updated
  }

  async function toggleActionItem(meetingId, index) {
    const meeting = await getMeeting(meetingId)
    if (meeting?.action_items?.[index]) {
      meeting.action_items[index].checked = !meeting.action_items[index].checked
      const checkedCount = meeting.action_items.filter(item => item.checked).length
      const progress = meeting.action_items.length > 0 
        ? Math.round((checkedCount / meeting.action_items.length) * 100) 
        : 0
      await updateMeetingData(meetingId, { action_items: meeting.action_items, progress })
    }
  }

  async function updateMeetingData(id, updates) {
    const updated = await updateMeeting(id, updates)
    currentMeeting.value = updated
    await loadMeetings()
    return updated
  }

  async function togglePin(id) {
    const meeting = await getMeeting(id)
    if (meeting) {
      const isPinned = !meeting.isPinned
      await updateMeeting(id, { isPinned })
      await loadMeetings()
    }
  }

  return {
    meetings, loading, currentMeeting,
    loadMeetings, loadMeeting, addMeeting,
    removeMeeting, saveAnalysis, toggleActionItem,
    updateMeetingData, togglePin
  }
})
