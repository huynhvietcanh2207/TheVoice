import { openDB } from 'idb'

const DB_NAME = 'meeting-recorder'
const DB_VERSION = 1
const STORE_NAME = 'meetings'

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('date', 'date')
        store.createIndex('status', 'status')
      }
    }
  })
}

export async function getAllMeetings() {
  const db = await getDB()
  const meetings = await db.getAll(STORE_NAME)
  return meetings.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export async function getMeeting(id) {
  const db = await getDB()
  return db.get(STORE_NAME, id)
}

export async function saveMeeting(meeting) {
  const db = await getDB()
  await db.put(STORE_NAME, meeting)
  return meeting
}

export async function deleteMeeting(id) {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export async function updateMeeting(id, updates) {
  const db = await getDB()
  const meeting = await db.get(STORE_NAME, id)
  if (!meeting) throw new Error('Meeting not found')
  const updated = { ...meeting, ...updates }
  await db.put(STORE_NAME, updated)
  return updated
}
