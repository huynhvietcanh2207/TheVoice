import { GoogleGenerativeAI } from '@google/generative-ai'

const LARGE_FILE_THRESHOLD_MB = 5
const FILE_UPLOAD_BASE_URL = 'https://generativelanguage.googleapis.com/upload/v1beta/files'
const FILE_STATUS_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta'
const FILE_ACTIVE_POLL_INTERVAL_MS = 1200
const FILE_ACTIVE_POLL_MAX_ATTEMPTS = 90

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function getMimeType(file) {
  if (file.type && file.type !== 'application/octet-stream') return file.type
  const ext = (file.name || '').split('.').pop()?.toLowerCase()
  const mimeMap = {
    mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4',
    ogg: 'audio/ogg', webm: 'audio/webm', flac: 'audio/flac',
    aac: 'audio/aac', opus: 'audio/opus',
  }
  return mimeMap[ext] || 'audio/webm'
}

export function isYouTubeUrl(str) {
  return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/.test(str)
}

export async function uploadFileToGemini(blob, apiKey, onProgress = () => {}) {
  const mimeType = getMimeType(blob)
  const uploadUrl = `${FILE_UPLOAD_BASE_URL}?key=${apiKey}`
  onProgress(15, 'Đang tải file âm thanh lên máy chủ AI...')

  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Protocol': 'raw',
      'X-Goog-Upload-Command': 'upload, finalize',
      'X-Goog-Upload-Header-Content-Length': blob.size,
      'X-Goog-Upload-Header-Content-Type': mimeType,
      'Content-Type': mimeType,
    },
    body: blob,
  })

  if (!uploadRes.ok) {
    const errText = await uploadRes.text()
    throw new Error(`Upload thất bại (${uploadRes.status}): ${errText}`)
  }

  const uploadData = await uploadRes.json()
  const fileUri = uploadData.file?.uri
  const fileName = uploadData.file?.name

  if (!fileUri || !fileName) throw new Error('Không nhận được fileUri.')

  let attempts = 0
  let state = 'PROCESSING'
  while (attempts < FILE_ACTIVE_POLL_MAX_ATTEMPTS) {
    const statusRes = await fetch(`${FILE_STATUS_BASE_URL}/${fileName}?key=${apiKey}`)
    const statusData = await statusRes.json()
    state = statusData.state

    if (state === 'ACTIVE') break
    if (state === 'FAILED') throw new Error('AI từ chối xử lý file này.')

    await new Promise(r => setTimeout(r, FILE_ACTIVE_POLL_INTERVAL_MS))
    attempts++
    onProgress(35 + Math.floor((attempts / FILE_ACTIVE_POLL_MAX_ATTEMPTS) * 15), 'Đang xử lý dữ liệu âm thanh...')
  }

  if (state !== 'ACTIVE') throw new Error('Timeout xử lý file.')
  return { fileUri, mimeType }
}

function extractJSON(raw) {
  let text = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
  try {
    return JSON.parse(text)
  } catch (_) {}

  const start = text.indexOf('{')
  if (start === -1) throw new SyntaxError('Không tìm thấy JSON.')

  let depth = 0, inString = false, escape = false, end = -1
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue
    if (ch === '{') depth++
    if (ch === '}') {
      depth--
      if (depth === 0) { end = i; break; }
    }
  }

  if (end === -1) throw new SyntaxError('JSON không khép kín.')
  return JSON.parse(text.substring(start, end + 1))
}

const AUDIO_ANALYSIS_SYSTEM_PROMPT = `Bạn là AI chuyên phân tích nội dung ghi âm công việc trong môi trường doanh nghiệp Việt Nam.
QUY TẮC BẮT BUỘC: Chỉ trả về JSON thuần túy. Không markdown, không giải thích ngoài JSON.
Ngôn ngữ: Hoàn toàn tiếng Việt.
SCHEMA:
{
  "title": "string ≤ 60 ký tự",
  "summary": "string 2-4 câu",
  "transcript": "string toàn bộ lời thoại",
  "key_points": ["string"],
  "decisions": [{"content": "string", "owner": "string"}],
  "action_items": [{"task": "string", "priority": "high|medium|low", "owner": "string", "deadline": "string", "status": "pending"}],
  "risks": ["string"],
  "progress": 0,
  "tags": ["string"],
  "mindmap": {"center": "string", "branches": [{"label": "string", "children": ["string"]}]}
}
Mindmap: 3-5 nhánh chính, mỗi nhánh 2-3 ý con.
Điền đầy đủ mọi trường, dùng mảng rỗng [] nếu không có dữ liệu.`

const AUDIO_ANALYSIS_USER_PROMPT = 'Phân tích file ghi âm này. Chỉ trả về JSON theo đúng schema, không thêm bất kỳ văn bản nào khác.'

async function generateWithRetry({ apiKey, modelName, fileUri, base64Data, mimeType, systemPrompt, userPrompt }) {
  const MAX_BUSY_RETRIES = 2
  let busyRetries = MAX_BUSY_RETRIES
  let delay = 1500

  while (true) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
        generationConfig: { temperature: 0.15, responseMimeType: 'application/json' },
      })

      const parts = []
      if (fileUri) {
        parts.push({
          fileData: { mimeType, fileUri }
        })
      } else if (base64Data) {
        parts.push({
          inlineData: { data: base64Data, mimeType }
        })
      }
      parts.push({ text: userPrompt })

      const signal = AbortSignal.timeout(90000)
      const result = await model.generateContent(parts, { signal })
      const raw = (await result.response).text()

      return extractJSON(raw)
    } catch (error) {
      const msg = (error.message || '').toLowerCase()
      const name = (error.name || '').toLowerCase()
      const isTimeout = name === 'timeouterror' || name === 'aborterror' || msg.includes('timeout') || msg.includes('abort')
      const isQuota   = msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted')
      const isBusy    = msg.includes('503') || msg.includes('overloaded') || msg.includes('unavailable') || isTimeout
      const isPayload = msg.includes('request_too_large') || msg.includes('payload') || (msg.includes('400') && (msg.includes('size') || msg.includes('large')))

      if (isQuota) throw new Error('QUOTA_EXHAUSTED')
      if (isPayload) throw new Error('FILE_TOO_LARGE_FOR_INLINE')

      if (isBusy && busyRetries > 0) {
        busyRetries--
        await new Promise(r => setTimeout(r, delay))
        delay = Math.round(delay * 1.8)
        continue
      }

      if (isBusy) throw new Error('SERVICE_BUSY')
      throw error
    }
  }
}

export async function analyzeMeeting(source, apiKey, modelName = 'gemini-3.5-flash', onProgress = () => {}, fallbackKeys = []) {
  if (!apiKey) throw new Error('Vui lòng nhập API key trong Cài đặt.')

  const isYouTube = typeof source === 'string' && isYouTubeUrl(source)
  const fileSizeMB = isYouTube ? 0 : (source.size / (1024 * 1024))
  let isLargeAudio = !isYouTube && (fileSizeMB > LARGE_FILE_THRESHOLD_MB)
  onProgress(5, 'Khởi tạo...')

  let fileUri = null
  let base64Data = null
  let mimeType = 'audio/webm'

  if (isYouTube) {
    fileUri = source
    mimeType = 'video/mp4'
  } else if (!isLargeAudio) {
    onProgress(20, 'Đang chuyển đổi âm thanh...')
    base64Data = await blobToBase64(source)
    mimeType = getMimeType(source)
  } else {
    mimeType = getMimeType(source)
  }

  const allKeys = [apiKey, ...fallbackKeys.filter(k => k && k !== apiKey)]
  let lastError = null

  for (let i = 0; i < allKeys.length; i++) {
    const currentKey = allKeys[i]

    try {
      if (isLargeAudio && !fileUri) {
        const uploadResult = await uploadFileToGemini(source, currentKey, onProgress)
        fileUri = uploadResult.fileUri
      }

      onProgress(45, i > 0 ? `API Key #${i + 1}: AI đang xử lý...` : 'AI đang xử lý...')

      let tickPercent = 50
      const ticker = setInterval(() => {
        if (tickPercent < 88) {
          tickPercent++
          onProgress(tickPercent, i > 0 ? `API Key #${i + 1}: Đang phân tích...` : 'AI đang phân tích nội dung...')
        }
      }, 1000)

      try {
        const result = await generateWithRetry({
          apiKey: currentKey, modelName, fileUri, base64Data, mimeType,
          systemPrompt: AUDIO_ANALYSIS_SYSTEM_PROMPT, userPrompt: AUDIO_ANALYSIS_USER_PROMPT,
        })
        clearInterval(ticker)
        onProgress(95, 'Hoàn tất phân tích!')
        return result
      } catch (generateErr) {
        clearInterval(ticker)
        throw generateErr
      }
    } catch (err) {
      lastError = err
      const errMsg = (err.message || '').toLowerCase()
      const isQuota = err.message === 'QUOTA_EXHAUSTED'
      const isBusy = err.message === 'SERVICE_BUSY'
      const isPermissionError = errMsg.includes('permission') || errMsg.includes('403') || errMsg.includes('not have')
      const isFailover = isQuota || isBusy || isPermissionError

      if (isFailover && i < allKeys.length - 1) {
        console.warn(`[Gemini Failover] Key #${i + 1} lỗi, chuyển sang Key #${i + 2}`)
        onProgress(48, `Key #${i + 1} lỗi/hết hạn, đang chuyển sang Key #${i + 2}...`)
        if (!isYouTube) fileUri = null // Reset để buộc key mới phải upload lại
        continue
      }

      if (err.message === 'FILE_TOO_LARGE_FOR_INLINE' && !fileUri) {
        onProgress(20, 'File lớn, đang chuyển sang File Upload API...')
        base64Data = null
        isLargeAudio = true
        fileUri = null
        i--
        continue
      }
      throw lastError
    }
  }
  throw lastError || new Error('Tất cả API Key đều thất bại.')
}

export async function chatWithMeeting(meetingContext, question, chatHistory = [], apiKey, modelName = 'gemini-3.5-flash') {
  if (!apiKey) throw new Error('Vui lòng nhập API key trong Cài đặt.')

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: modelName })

  const systemContext = `Bạn là trợ lý AI phân tích cuộc họp. Dựa vào nội dung cuộc họp bên dưới, hãy trả lời câu hỏi của người dùng một cách chính xác và hữu ích. Trả lời bằng tiếng Việt.

=== NỘI DUNG CUỘC HỌP ===
📝 Tóm tắt: ${meetingContext.summary || 'Không có'}

📋 Ý chính:
${(meetingContext.key_points || []).map((p, i) => `${i + 1}. ${p}`).join('\n')}

✅ Quyết định:
${(meetingContext.decisions || []).map((d, i) => {
  if (typeof d === 'string') return `${i + 1}. ${d}`
  if (d && d.content) {
    const ownerInfo = d.owner ? ` (Phụ trách: ${d.owner})` : ''
    return `${i + 1}. ${d.content}${ownerInfo}`
  }
  return ''
}).filter(Boolean).join('\n')}

📄 Transcript:
${meetingContext.transcript || 'Không có transcript'}
=== HẾT NỘI DUNG ===

Hãy trả lời ngắn gọn, dễ hiểu. Nếu không tìm thấy thông tin trong cuộc họp, hãy nói rõ.`

  const contents = []
  
  contents.push({
    role: 'user',
    parts: [{ text: systemContext + '\n\nCâu hỏi: ' + (chatHistory.length === 0 ? question : 'Bắt đầu phân tích.') }]
  })

  if (chatHistory.length === 0) {
    // First question
  } else {
    contents.push({
      role: 'model',
      parts: [{ text: 'Tôi đã đọc nội dung cuộc họp. Hãy đặt câu hỏi.' }]
    })

    for (const msg of chatHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })
    }

    contents.push({
      role: 'user',
      parts: [{ text: question }]
    })
  }

  const result = await model.generateContent({ contents })
  return result.response.text()
}
