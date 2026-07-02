import jsPDF from 'jspdf'
import html2canvas from 'html2canvas-pro'

/**
 * Convert meeting data to Markdown string
 */
export function toMarkdown(meeting) {
  let md = `# ${meeting.name}\n`
  md += `📅 ${new Date(meeting.date).toLocaleDateString('vi-VN')} | ⏱ ${formatDuration(meeting.duration)}\n\n`

  if (meeting.transcript) {
    md += `## 📝 Transcript\n${meeting.transcript}\n\n`
  }

  if (meeting.summary) {
    md += `## 📋 Tóm tắt\n${meeting.summary}\n\n`
  }

  if (meeting.key_points?.length) {
    md += `## 🎯 Ý chính\n`
    meeting.key_points.forEach(p => { md += `- ${p}\n` })
    md += '\n'
  }

  if (meeting.decisions?.length) {
    md += `## ✅ Quyết định\n`
    meeting.decisions.forEach(d => { md += `- ${d}\n` })
    md += '\n'
  }

  if (meeting.action_items?.length) {
    md += `## 📌 Action Items\n`
    meeting.action_items.forEach(item => {
      const check = item.checked ? '[x]' : '[ ]'
      const owner = item.owner ? ` — ${item.owner}` : ''
      const deadline = item.deadline ? ` (${item.deadline})` : ''
      const priority = item.priority ? ` [${item.priority.toUpperCase()}]` : ''
      md += `- ${check} ${item.task}${owner}${deadline}${priority}\n`
    })
    md += '\n'
  }

  return md
}

/**
 * Export a DOM element as PDF
 */
export async function toPDF(elementId, filename = 'meeting-report.pdf') {
  const element = document.getElementById(elementId)
  if (!element) throw new Error('Element not found')

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#0f172a',
    useCORS: true,
    logging: false
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
    unit: 'px',
    format: [canvas.width, canvas.height]
  })

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
  pdf.save(filename)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text)
}

function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
