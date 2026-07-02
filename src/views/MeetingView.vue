<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
      <div>
        <router-link to="/" class="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent-500 transition-colors mb-3">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {{ $t('common.back') }}
        </router-link>
        <h1 class="text-2xl lg:text-3xl font-black bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 bg-clip-text text-transparent">{{ meeting?.name || $t('common.loading') }}</h1>
        <div class="flex items-center gap-3 mt-2 text-sm text-text-main font-medium opacity-90">
          <span>{{ formatDate(meeting?.date) }}</span>
          <span v-if="meeting?.duration > 0">•</span>
          <span v-if="meeting?.duration > 0">{{ formatDuration(meeting?.duration) }}</span>
          <span v-if="meeting?.source === 'youtube'" class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded-full border border-red-500/20">
            ▶ YouTube
          </span>
          <span v-else-if="meeting?.source === 'upload'" class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-accent-500/10 text-accent-500 text-[10px] font-bold uppercase rounded-full border border-accent-500/20">
            📁 Upload
          </span>
          <span v-else-if="meeting?.source === 'notes'" class="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase rounded-full border border-emerald-500/20">
            📝 Note
          </span>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div class="skeleton h-10 w-64 mb-6" />
      <div class="skeleton h-40 w-full rounded-2xl" />
    </div>

    <div v-else-if="meeting">
      <!-- Tabs -->
      <div class="relative w-full mb-6 group/tabs">
        <!-- Scroll Buttons -->
        <button 
          @click="scrollTabs('left')"
          class="absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-navy-800/95 border border-navy-700/50 text-text-muted hover:text-text-main shadow-xl transition-all active:scale-90"
          :class="!canScrollLeft ? 'opacity-20 pointer-events-none' : 'opacity-100'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>

        <div 
          ref="tabContainer"
          @scroll="checkScroll"
          class="flex gap-1 p-1 bg-navy-800/40 rounded-xl shadow-inner border border-navy-700/60 overflow-x-auto thin-scrollbar scroll-smooth whitespace-nowrap snap-x snap-proximity"
        >
          <button 
            v-for="tab in tabs" 
            :key="tab.key"
            @click="activeTab = tab.key"
            class="px-5 py-2 text-sm font-bold rounded-lg transition-all duration-200 shrink-0 snap-start"
            :class="activeTab === tab.key 
              ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30' 
              : 'text-text-main/70 hover:text-text-main hover:bg-navy-800/50'"
          >
            {{ tab.label }}
          </button>
        </div>

        <button 
          @click="scrollTabs('right')"
          class="absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-navy-800/95 border border-navy-700/50 text-text-muted hover:text-text-main shadow-xl transition-all active:scale-90"
          :class="!canScrollRight ? 'opacity-20 pointer-events-none' : 'opacity-100'"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>
      </div>

      <!-- Main layout -->
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Main content area -->
        <div class="flex-1 min-w-0" id="meeting-content">
          <!-- Tab: Summary -->
          <div v-if="activeTab === 'summary'" class="space-y-6">
          <!-- Summary -->
          <div class="glass-card rounded-2xl p-6">
            <h3 class="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              {{ $t('meeting.summary') }}
            </h3>
            <div class="flex items-start gap-4">
              <p class="flex-1 text-text-main text-sm leading-relaxed">{{ meeting.summary || $t('meeting.no_summary') }}</p>
              <button 
                @click="copyText(meeting.summary)" 
                class="p-2 rounded-lg bg-navy-800/50 text-text-muted hover:text-accent-500 hover:bg-navy-700 transition-all shrink-0"
                :title="$t('meeting.copy_markdown')"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 5a1 1 0 011-1h6a1 1 0 011 1v1h1a2 2 0 012 2v11a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2h1V5z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Key points -->
          <div v-if="meeting.key_points?.length" class="glass-card rounded-2xl p-6">
            <h3 class="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              {{ $t('meeting.key_points') }}
            </h3>
            <ul class="space-y-2">
              <li v-for="(point, i) in meeting.key_points" :key="i" class="flex items-start gap-3 text-sm text-text-main">
                <span class="w-5 h-5 rounded-full bg-accent-500/10 text-accent-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{{ i + 1 }}</span>
                {{ point }}
              </li>
            </ul>
          </div>
          <div v-else-if="activeTab === 'summary'" class="text-center py-6 glass-card rounded-2xl opacity-40">
             <p class="text-xs text-text-muted">{{ $t('meeting.no_points') }}</p>
          </div>

          <!-- Decisions -->
          <div v-if="meeting.decisions?.length" class="glass-card rounded-2xl p-6">
            <h3 class="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ $t('meeting.decisions') }}
            </h3>
            <ul class="space-y-2">
              <li v-for="(decision, i) in meeting.decisions" :key="i" class="flex items-start gap-3 text-sm text-text-main">
                <svg class="w-4 h-4 text-accent-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span v-if="typeof decision === 'string'">{{ decision }}</span>
                <span v-else-if="decision && decision.content">
                  {{ decision.content }}
                  <span v-if="decision.owner" class="text-xs text-text-muted italic ml-1.5">
                    ({{ settingsStore.language === 'vi' ? 'Phụ trách' : 'Owner' }}: {{ decision.owner }})
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Tab: Transcript -->
        <div v-else-if="activeTab === 'transcript'" class="space-y-4">
          <div class="glass-card rounded-2xl p-6 mt-2 ml-auto mr-auto text-left relative group">
            <button 
              @click="copyText(meeting.transcript)" 
              class="absolute top-4 right-4 p-2 rounded-lg bg-navy-800 text-text-muted hover:text-accent-500 hover:bg-navy-700 transition-all opacity-0 group-hover:opacity-100"
              :title="$t('common.copy')"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 5a1 1 0 011-1h6a1 1 0 011 1v1h1a2 2 0 012 2v11a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2h1V5z" />
              </svg>
            </button>
            <p v-if="meeting.transcript" class="text-sm text-text-main leading-relaxed whitespace-pre-wrap">{{ meeting.transcript }}</p>
            <p v-else class="text-sm text-text-muted text-center py-10 italic">Chưa có dữ liệu nội dung</p>
          </div>
        </div>

        <!-- Tab: Action Items -->
        <div v-else-if="activeTab === 'actions'" class="space-y-3">
          <!-- Progress Bar -->
          <div v-if="meeting.action_items?.length" class="glass-card rounded-2xl p-5 mb-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-bold text-text-muted uppercase tracking-wider">Tiến độ công việc</span>
              <span class="text-sm font-black text-accent-500">{{ meeting.progress || 0 }}%</span>
            </div>
            <div class="h-2 bg-navy-800/40 rounded-full overflow-hidden border border-navy-700/50 shadow-inner">
              <div 
                class="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full transition-all duration-500" 
                :style="{ width: `${meeting.progress || 0}%` }"
              />
            </div>
          </div>

          <div v-if="!meeting.action_items?.length" class="text-center py-16 px-6 glass-card rounded-3xl border-dashed border-navy-700">
            <div class="w-16 h-16 mx-auto mb-4 bg-navy-800/10 rounded-full flex items-center justify-center text-text-muted/40">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p class="text-text-main font-medium mb-1">{{ $t('meeting.no_tasks') }}</p>
            <p class="text-xs text-text-muted max-w-[240px] mx-auto leading-relaxed">
              AI sẽ tự động phân tích và trích xuất các nhiệm vụ, deadline từ nội dung cuộc họp của bạn tại đây.
            </p>
          </div>
          <div 
            v-for="(item, i) in meeting.action_items" 
            :key="i" 
            class="glass-card rounded-2xl p-5 flex items-start gap-4"
            :class="{ 'opacity-50': item.checked }"
          >
            <button 
              @click="toggleItem(i)"
              class="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
              :class="item.checked 
                ? 'bg-accent-500 border-accent-500 text-white' 
                : 'border-navy-600 hover:border-accent-400'"
            >
              <svg v-if="item.checked" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-text-main" :class="{ 'line-through': item.checked }">
                {{ item.task }}
              </p>
              <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-muted">
                <span v-if="item.owner" class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  {{ item.owner }}
                </span>
                <span v-if="item.deadline" class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {{ item.deadline }}
                </span>
              </div>
            </div>

            <span 
              class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0"
              :class="{
                'bg-red-500/10 text-red-500 border border-red-500/20': item.priority === 'high',
                'bg-amber-500/10 text-amber-500 border border-amber-500/20': item.priority === 'medium',
                'bg-navy-800 text-text-muted border border-navy-700/50': item.priority === 'low'
              }"
            >
              {{ item.priority === 'high' ? 'Gấp' : item.priority === 'medium' ? 'Thường' : 'Thấp' }}
            </span>
          </div>
        </div>

        <!-- Tab: Mind Map -->
        <div v-else-if="activeTab === 'mindmap'">
          <div class="glass-card rounded-2xl overflow-hidden bg-slate-50 dark:bg-[#0c1210]" style="height: 500px;">
            <MindMapView v-if="meeting.mindmap" :data="meeting.mindmap" />
            <div v-else class="flex items-center justify-center h-full text-text-muted italic">
              <p>Không có dữ liệu sơ đồ</p>
            </div>
          </div>
        </div>

        <!-- Tab: AI Chat -->
        <div v-else-if="activeTab === 'chat'" class="glass-card rounded-2xl overflow-hidden flex flex-col" style="height: 600px;">
          <!-- Chat Header -->
          <div class="border-b border-navy-700/50 p-4 bg-navy-800/20 flex justify-between items-center shrink-0">
            <span class="text-xs font-bold text-text-muted uppercase tracking-wider">Hỏi AI Trợ Lý</span>
            <button 
              v-if="chatMessages.length > 0"
              @click="clearChat" 
              class="p-2 rounded-xl text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
              title="Xóa lịch sử chat"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>

          <!-- Quick suggestions (show when no messages) -->
          <div v-if="chatMessages.length === 0" class="flex-1 flex flex-col items-center justify-center p-8 text-center flex-shrink-0">
            <div class="w-16 h-16 rounded-2xl bg-accent-500/10 flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183A1.14 1.14 0 0112.846 16.5h.907c2.053 0 3.879-.855 5.17-2.214A8.98 8.98 0 0021 9.75c0-5.004-4.03-9-9-9-4.97 0-9 3.996-9 9 0 1.614.417 3.13 1.146 4.444" />
              </svg>
            </div>
            <p class="text-text-main font-medium mb-1">{{ $t('meeting.ask_ai_title') }}</p>
            <p class="text-text-muted text-sm mb-6">{{ $t('meeting.ai_placeholder') }}</p>
            <div class="flex flex-wrap justify-center gap-2">
              <button 
                v-for="(suggestion, i) in quickSuggestions" 
                :key="i"
                @click="askQuestion(suggestion)"
                class="px-3.5 py-2 bg-navy-800/40 hover:bg-navy-800 border border-navy-700/50 text-text-muted hover:text-text-main text-xs font-medium rounded-full transition-all hover:-translate-y-0.5"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>

          <!-- Chat messages -->
          <div v-else ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
            <div 
              v-for="(msg, i) in chatMessages" 
              :key="i"
              class="flex gap-3"
              :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <!-- AI avatar -->
              <div v-if="msg.role === 'ai'" class="w-7 h-7 rounded-full bg-accent-500/15 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <svg class="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>

              <!-- Message bubble -->
              <div 
                class="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md"
                :class="msg.role === 'user' 
                  ? 'bg-gradient-to-br from-accent-500 to-accent-600 text-white font-bold rounded-br-md shadow-accent-600/20' 
                  : 'bg-navy-800/40 text-text-main border border-navy-700/50 rounded-bl-md'"
              >
                <div class="whitespace-pre-wrap">{{ msg.content }}</div>
                <div class="text-[10px] mt-1.5 opacity-50">{{ formatChatTime(msg.timestamp) }}</div>
              </div>

              <!-- User avatar -->
              <div v-if="msg.role === 'user'" class="w-7 h-7 rounded-full bg-navy-800 border border-navy-700/50 flex items-center justify-center shrink-0 mt-1">
                <svg class="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="isChatLoading" class="flex gap-3">
              <div class="w-7 h-7 rounded-full bg-accent-500/15 flex items-center justify-center shrink-0 mt-1">
                <svg class="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <div class="bg-navy-800/40 border border-navy-700/50 px-4 py-3 rounded-2xl rounded-bl-md">
                <div class="flex gap-1.5">
                  <div class="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style="animation-delay: 0ms" />
                  <div class="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style="animation-delay: 150ms" />
                  <div class="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style="animation-delay: 300ms" />
                </div>
              </div>
            </div>
          </div>

          <!-- Chat input -->
          <div class="border-t border-navy-700/50 p-4 bg-navy-800/20">
            <div class="flex gap-2">
              <input 
                v-model="chatInput"
                @keydown.enter.prevent="sendChat"
                type="text"
                :placeholder="$t('meeting.ai_placeholder')"
                class="flex-1 px-4 py-3.5 bg-navy-800/40 border border-navy-700/50 rounded-xl text-text-main text-sm placeholder:text-text-muted focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/25 transition-all shadow-inner"
                :disabled="isChatLoading"
              />
              <button 
                @click="sendChat"
                :disabled="!chatInput.trim() || isChatLoading"
                class="px-4 py-3 bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600 hover:from-accent-300 hover:to-accent-500 disabled:from-navy-800 disabled:to-navy-800 disabled:text-text-muted text-white font-bold rounded-xl transition-all shadow-lg shadow-accent-500/30 active:scale-95"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Export bar (Moved below tabs content) -->
        <div class="mt-8 flex flex-wrap gap-3">
          <button 
            @click="copyMD"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-800/40 hover:bg-navy-800 border border-navy-700/50 text-text-muted hover:text-text-main text-sm font-medium rounded-xl transition-all"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
            {{ $t('meeting.copy_markdown') }}
          </button>
          <button 
            @click="exportPDF"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-800/40 hover:bg-navy-800 border border-navy-700/50 text-text-muted hover:text-text-main text-sm font-medium rounded-xl transition-all"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {{ $t('meeting.export_pdf') }}
          </button>
          <button 
            @click="reanalyze"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-accent-500/25 transition-all"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            {{ $t('common.process') }}
          </button>
        </div>
      </div> <!-- /Left: Meeting Content -->

      <!-- Right: Quick Actions Sidebar (Tags & Notes) -->
      <div class="lg:w-80 shrink-0 space-y-6 mt-8 lg:mt-0">
        <!-- Tags Manager -->
        <div class="glass-card rounded-2xl p-6">
          <h3 class="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg class="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.659A2.25 2.25 0 009.568 3z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            {{ $t('meeting.tags') }}
          </h3>
          
          <div class="flex flex-wrap gap-2 mb-4">
            <span 
              v-for="tag in meeting.tags || []" 
              :key="tag"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy-800 text-text-main text-xs border border-navy-700 group/tag"
            >
              #{{ tag }}
              <button @click="removeTag(tag)" class="text-text-muted hover:text-red-500 transition-colors">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </span>
            <p v-if="!meeting.tags?.length" class="text-xs text-text-muted italic opacity-50">{{ $t('meeting.no_tags') }}</p>
          </div>

          <div class="relative">
            <input 
              v-model="newTag"
              @keydown.enter="addTag"
              type="text"
              class="w-full px-4 py-2.5 bg-navy-800/20 border border-navy-700/50 rounded-xl text-xs text-text-main placeholder:text-text-muted/40 focus:outline-none focus:border-accent-500/50 transition-all font-medium"
              placeholder="..."
            />
            <button @click="addTag" class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-accent-500 hover:text-accent-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </button>
          </div>
        </div>

        <!-- Personal Notes -->
        <div class="glass-card rounded-2xl p-6 min-h-[300px] flex flex-col">
          <h3 class="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              {{ $t('meeting.notes') }}
            </div>
            <span v-if="savingNotes" class="text-[10px] text-accent-500 font-bold animate-pulse">ĐANG LƯU...</span>
            <span v-else class="text-[10px] text-text-muted opacity-50 uppercase font-black">TỰ ĐỘNG</span>
          </h3>
          
          <textarea 
            v-model="personalNotes"
            @input="handleNotesInput"
            :placeholder="$t('meeting.notes_placeholder')"
            class="flex-1 w-full bg-transparent border-none text-sm text-text-main placeholder:text-text-muted/30 focus:outline-none resize-none leading-relaxed"
          ></textarea>
        </div>
      </div> <!-- /Right: Sidebar -->
    </div> <!-- /Main layout -->
  </div>
 </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMeetingsStore } from '@/stores/meetings'
import { useSettingsStore } from '@/stores/settings'
import { useToast } from '@/composables/useToast'
import { toMarkdown, toPDF, copyToClipboard } from '@/lib/export'
import { chatWithMeeting } from '@/lib/gemini'
import MindMapView from '@/components/MindMapView.vue'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const store = useMeetingsStore()
const settingsStore = useSettingsStore()
const { success, error: toastError } = useToast()
const { t } = useI18n()

const meeting = computed(() => store.currentMeeting)
const loading = ref(true)
const activeTab = ref('summary')

// Tags & Notes state
const newTag = ref('')
const personalNotes = ref('')
const savingNotes = ref(false)
let notesTimeout = null

// Chat state
const chatInput = ref('')
const chatMessages = ref([])
const isChatLoading = ref(false)
const chatContainer = ref(null)
const tabContainer = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

function checkScroll() {
  if (!tabContainer.value) return
  const { scrollLeft, scrollWidth, clientWidth } = tabContainer.value
  canScrollLeft.value = scrollLeft > 2
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 2
}

function scrollTabs(direction) {
  if (!tabContainer.value) return
  const scrollAmount = 150
  tabContainer.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
  // Update UI after a short delay for smooth scroll
  setTimeout(checkScroll, 350)
}

const tabs = computed(() => [
  { key: 'summary', label: t('meeting.summary') },
  { key: 'transcript', label: t('meeting.transcript') },
  { key: 'actions', label: t('meeting.actions') },
  { key: 'mindmap', label: 'MindMap' },
  { key: 'chat', label: t('meeting.ask_ai') }
])

const quickSuggestions = computed(() => [
  'Tóm tắt ngắn gọn cuộc họp?',
  'Ai phụ trách việc gì?',
  'Deadline quan trọng nhất?',
  'Có quyết định nào chưa rõ ràng?',
])

// Chat history key in localStorage
function getChatStorageKey() {
  return `voice_chat_${route.params.id}`
}

// Load chat history from localStorage
function loadChatHistory() {
  try {
    const stored = localStorage.getItem(getChatStorageKey())
    if (stored) {
      chatMessages.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load chat history:', e)
  }
}

// Save chat history to localStorage
function saveChatHistory() {
  try {
    localStorage.setItem(getChatStorageKey(), JSON.stringify(chatMessages.value))
  } catch (e) {
    console.error('Failed to save chat history:', e)
  }
}

function clearChat() {
  chatMessages.value = []
  localStorage.removeItem(getChatStorageKey())
}

async function scrollToBottom() {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

async function askQuestion(question) {
  chatInput.value = question
  await sendChat()
}

async function sendChat() {
  const question = chatInput.value.trim()
  if (!question || isChatLoading.value) return
  
  if (!settingsStore.hasApiKey) {
    toastError(t('common.error_no_api_key'))
    return
  }

  // Add user message
  chatMessages.value.push({
    role: 'user',
    content: question,
    timestamp: Date.now()
  })
  chatInput.value = ''
  saveChatHistory()
  await scrollToBottom()

  // Call Gemini
  isChatLoading.value = true
  try {
    const context = {
      transcript: meeting.value?.transcript || '',
      summary: meeting.value?.summary || '',
      key_points: meeting.value?.key_points || [],
      decisions: meeting.value?.decisions || []
    }

    // Only pass previous messages (exclude system, just user/ai pairs)
    const history = chatMessages.value
      .slice(0, -1) // exclude the just-added user message
      .map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.content }))

    const response = await chatWithMeeting(
      context,
      question,
      history,
      settingsStore.currentApiKey,
      settingsStore.modelName
    )

    chatMessages.value.push({
      role: 'ai',
      content: response,
      timestamp: Date.now()
    })
    saveChatHistory()
  } catch (err) {
    chatMessages.value.push({
      role: 'ai',
      content: `❌ Lỗi: ${err.message}`,
      timestamp: Date.now()
    })
    saveChatHistory()
  } finally {
    isChatLoading.value = false
    await scrollToBottom()
  }
}

onMounted(async () => {
  const scrollId = route.params.id
  await store.loadMeeting(scrollId)
  if (meeting.value) {
    personalNotes.value = meeting.value.notes || ''
  }
  loading.value = false
  loadChatHistory()

  // Track tab scroll
  nextTick(() => {
    checkScroll()
    if (tabContainer.value) {
      const resizeObserver = new ResizeObserver(checkScroll)
      resizeObserver.observe(tabContainer.value)
    }
  })
})

async function addTag() {
  const tag = newTag.value.trim().replace(/^#/, '')
  if (!tag || meeting.value?.tags?.includes(tag)) {
    newTag.value = ''
    return
  }
  const tags = [...(meeting.value?.tags || []), tag]
  await store.updateMeetingData(route.params.id, { tags })
  newTag.value = ''
  success(t('common.success'))
}

async function removeTag(tagToRemove) {
  const tags = meeting.value?.tags.filter(t => t !== tagToRemove)
  await store.updateMeetingData(route.params.id, { tags })
  success(t('common.success'))
}

function handleNotesInput() {
  savingNotes.value = true
  if (notesTimeout) clearTimeout(notesTimeout)
  notesTimeout = setTimeout(async () => {
    await store.updateMeetingData(route.params.id, { notes: personalNotes.value })
    savingNotes.value = false
    // success('Auto-saved')
  }, 1000)
}

async function copyText(text) {
  if (!text) return
  try {
    await copyToClipboard(text)
    success(t('common.success'))
  } catch (e) {
    toastError(t('common.error'))
  }
}

async function toggleItem(index) {
  await store.toggleActionItem(route.params.id, index)
  meeting.value = store.currentMeeting
}

async function copyMD() {
  if (!meeting.value) return
  try {
    const md = toMarkdown(meeting.value)
    await copyToClipboard(md)
    success('Markdown copied')
  } catch (e) {
    toastError(t('common.error'))
  }
}

async function exportPDF() {
  if (!meeting.value) return
  try {
    await toPDF('meeting-content', `${meeting.value.name || 'meeting'}.pdf`)
    success('PDF exported')
  } catch (e) {
    toastError(t('common.error'))
    console.error(e)
  }
}

function reanalyze() {
  router.push(`/processing/${route.params.id}`)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', { 
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  })
}

function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatChatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
</style>
