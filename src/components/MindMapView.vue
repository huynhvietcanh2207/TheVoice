<template>
  <div ref="mindmapContainer" class="w-full h-full min-h-[400px] relative">
    <svg ref="svgEl" class="w-full h-full markmap" />
    
    <!-- Controls -->
    <div class="absolute bottom-4 right-4 flex gap-2">
      <button @click="zoomIn" class="p-2 rounded-lg bg-navy-800/80 backdrop-blur border border-navy-700/50 text-navy-300 hover:text-accent-400 hover:bg-navy-700 transition-all shadow-lg" title="Phóng to">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
        </svg>
      </button>
      <button @click="zoomOut" class="p-2 rounded-lg bg-navy-800/80 backdrop-blur border border-navy-700/50 text-navy-300 hover:text-accent-400 hover:bg-navy-700 transition-all shadow-lg" title="Thu nhỏ">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
        </svg>
      </button>
      <button @click="fitView" class="p-2 rounded-lg bg-navy-800/80 backdrop-blur border border-navy-700/50 text-navy-300 hover:text-accent-400 hover:bg-navy-700 transition-all shadow-lg" title="Vừa khung">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
      </button>
      <button @click="exportSVG" class="p-2 rounded-lg bg-navy-800/80 backdrop-blur border border-navy-700/50 text-navy-300 hover:text-accent-400 hover:bg-navy-700 transition-all shadow-lg" title="Tải SVG">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
      <button @click="exportPNG" class="p-2 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 backdrop-blur text-white hover:from-accent-300 hover:to-accent-500 transition-all shadow-lg shadow-accent-600/30" title="Xuất PNG">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps({
  data: { type: Object, default: null }
})

const svgEl = ref(null)
const mindmapContainer = ref(null)
let mm = null

const settings = useSettingsStore()

const isLight = computed(() => {
  if (settings.theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: light)').matches
  }
  return settings.theme === 'light'
})

watch(isLight, () => {
  renderMindmap()
})

function buildMarkdown(data) {
  if (!data) return '# No data'
  let md = `# ${data.center || 'Cuộc họp'}\n\n`
  if (data.branches) {
    data.branches.forEach(branch => {
      md += `## ${branch.label}\n\n`
      if (branch.children) {
        branch.children.forEach(child => {
          md += `- ${child}\n`
        })
      }
      md += '\n'
    })
  }
  return md
}

function renderMindmap() {
  if (!svgEl.value || !props.data) return
  
  const transformer = new Transformer()
  const markdown = buildMarkdown(props.data)
  const { root } = transformer.transform(markdown)
  
  // Clear existing
  svgEl.value.innerHTML = ''
  
  mm = Markmap.create(svgEl.value, {
    colorFreezeLevel: 2,
    duration: 500,
    maxWidth: 300,
    initialExpandLevel: 3,
    zoom: true,
    pan: true
  }, root)

  // Apply responsive theme styling
  nextTick(() => {
    const svgNode = svgEl.value
    if (svgNode) {
      svgNode.style.background = 'transparent'
      const texts = svgNode.querySelectorAll('text')
      const isL = isLight.value
      texts.forEach(t => {
        t.style.fill = isL ? '#0f172a' : '#e2e8f0'
        t.style.fontSize = '14px'
        t.style.fontWeight = '500'
      })
    }
  })
}

function zoomIn() {
  if (mm) mm.rescale(1.25)
}

function zoomOut() {
  if (mm) mm.rescale(0.8)
}

function fitView() {
  if (mm) mm.fit()
}

function exportSVG() {
  if (!svgEl.value) return
  
  const svg = svgEl.value
  const bbox = svg.getBBox()
  const padding = 30
  
  const clone = svg.cloneNode(true)
  
  const width = bbox.width + padding * 2
  const height = bbox.height + padding * 2
  
  clone.setAttribute('width', '100%')
  clone.setAttribute('height', '100%')
  clone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`)
  
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  const isL = isLight.value
  const textFill = isL ? '#0f172a' : '#e2e8f0'
  const bgFill = isL ? '#f8fafc' : '#0c1210'
  
  style.textContent = `
    svg { background-color: ${bgFill}; }
    .markmap-node { font-family: system-ui, -apple-system, sans-serif; }
    .markmap-node text { fill: ${textFill} !important; font-size: 14px; font-weight: 500; }
    .markmap-link { stroke-width: 2.5px; opacity: 0.7; }
  `
  clone.insertBefore(style, clone.firstChild)
  
  // Wrapper SVG
  const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  wrapper.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  wrapper.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`)
  wrapper.setAttribute('width', width)
  wrapper.setAttribute('height', height)
  
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('x', bbox.x - padding)
  rect.setAttribute('y', bbox.y - padding)
  rect.setAttribute('width', width)
  rect.setAttribute('height', height)
  rect.setAttribute('fill', bgFill)
  wrapper.appendChild(rect)
  
  while (clone.firstChild) {
    wrapper.appendChild(clone.firstChild)
  }
  
  const svgData = new XMLSerializer().serializeToString(wrapper)
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.download = `meeting-mindmap-${Date.now()}.svg`
  a.href = url
  a.click()
  
  URL.revokeObjectURL(url)
}

function exportPNG() {
  if (!svgEl.value) return
  
  const svg = svgEl.value
  const bbox = svg.getBBox()
  const padding = 40
  
  // Clone the SVG element
  const clone = svg.cloneNode(true)
  
  // Create a wrapper SVG with correct dimensions to capture EVERYTHING
  const width = bbox.width + padding * 2
  const height = bbox.height + padding * 2
  
  clone.setAttribute('width', width)
  clone.setAttribute('height', height)
  clone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`)
  
  // Ensure styles are properly applied (Markmap default colors)
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  const isL = isLight.value
  const textFill = isL ? '#0f172a' : '#ffffff'
  const bgColor = isL ? '#f8fafc' : '#0c1210'

  style.textContent = `
    .markmap-node { font-family: sans-serif; }
    .markmap-node-text { fill: ${textFill}; font-size: 14px; font-weight: 500; }
    .markmap-link { stroke: #E02F75; stroke-width: 2.5; opacity: 0.6; }
  `
  clone.insertBefore(style, clone.firstChild)
  
  const svgData = new XMLSerializer().serializeToString(clone)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  // High res factor
  const scale = 2
  canvas.width = width * scale
  canvas.height = height * scale
  
  const img = new Image()
  img.onload = () => {
    // Fill background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw the image
    ctx.scale(scale, scale)
    ctx.drawImage(img, 0, 0)
    
    // Download
    const a = document.createElement('a')
    a.download = `meeting-mindmap-${Date.now()}.png`
    a.href = canvas.toDataURL('image/png')
    a.click()
  }
  
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
}

watch(() => props.data, () => {
  nextTick(() => renderMindmap())
}, { deep: true })

onMounted(() => {
  if (props.data) renderMindmap()
})
</script>

<style>
/* Force text colors in Markmap SVG for readability */
svg.markmap text,
.markmap text {
  fill: #ffffff !important; /* Pure white in dark mode */
  font-size: 13px !important;
  font-weight: 600 !important;
}

.light svg.markmap text,
.light .markmap text {
  fill: #0f172a !important; /* Dark slate in light mode */
}
</style>
