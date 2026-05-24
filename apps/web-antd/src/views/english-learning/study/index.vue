<template>
  <div class="h-full flex flex-col bg-gradient-to-br from-slate-900 via-[#0c0c1d] to-stone-900">
    <!-- Top bar -->
    <div class="flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-xl border-b border-white/10">
      <div class="flex items-center gap-3">
        <h1 class="text-lg font-bold text-white">📺 智启英语 - 在线学习</h1>
        <span class="px-2.5 py-1 bg-en-500/20 text-en-300 rounded-full text-[10px] font-bold border border-en-500/30">
          当前：{{ currentCategory }}
        </span>
      </div>
      <div class="flex items-center gap-3">
        <XpBar />
        <button
          class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-all"
          title="配置 API Key"
          @click="openApiKeyModal"
        >
          <span class="text-sm">⚙️</span>
        </button>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <!-- Left Sidebar - Course Catalog -->
      <div
        :class="[
          'bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0',
          sidebarOpen ? 'w-72' : 'w-0',
        ]"
      >
        <div v-if="sidebarOpen" class="flex flex-col h-full">
          <div class="p-4 border-b border-white/10">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold text-white/80">课程目录</h2>
              <span class="text-[10px] text-white/40 font-mono">{{ totalWatched }}/{{ totalVideos }} 已完成</span>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-3 space-y-4">
            <div v-for="(videos, category) in videoDict" :key="category" class="space-y-1">
              <div class="text-[10px] font-bold text-white/40 uppercase tracking-wider px-2 mb-1.5">{{ category }}</div>
              <div
                v-for="(video, vi) in videos"
                :key="video.id"
                :class="[`delay-${vi % 6}`, 'group relative px-3 py-3 rounded-xl cursor-pointer transition-all animate-fade-in-up opacity-0',
                  currentVideo.id === video.id
                    ? 'bg-en-500/20 border-l-2 border-en-400'
                    : 'hover:bg-white/5 border-l-2 border-transparent']"
                @click="selectVideo(video, category)"
              >
                <div class="flex items-start gap-3">
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-bold text-white/80 group-hover:text-white transition-colors truncate">
                      {{ video.title }}
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                      <span class="text-[10px] text-white/30 font-mono">{{ video.duration }}</span>
                      <span v-if="videoProgress[video.id]" class="text-[10px] text-emerald-400">✅ 已学完</span>
                    </div>
                  </div>
                  <div v-if="!videoProgress[video.id]" class="w-6 h-6 rounded-full border-2 border-white/10 flex-shrink-0" />
                  <div v-else class="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <span class="text-[10px]">✅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar toggle -->
      <button
        class="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-12 bg-white/5 backdrop-blur-xl rounded-r-xl border border-white/10 border-l-0 flex items-center justify-center text-white/40 hover:text-white/80 transition-all cursor-pointer"
        @click="sidebarOpen = !sidebarOpen"
      >
        <span class="text-xs">{{ sidebarOpen ? '◀' : '▶' }}</span>
      </button>

      <!-- Center - Video Player + Tabs -->
      <div class="flex-1 flex flex-col overflow-hidden relative">
        <!-- Video area -->
        <div class="relative bg-black flex-shrink-0" style="height: 55%; min-height: 320px;">
          <iframe
            :key="currentVideo.id"
            :src="`//player.bilibili.com/player.html?bvid=${currentVideo.bvid}&page=1&high_quality=1&danmaku=0`"
            allowfullscreen="true"
            class="w-full h-full border-0"
          />

          <!-- Video overlay info -->
          <div class="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div class="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white text-xs font-medium">
              {{ currentVideo.title }}
            </div>
            <div class="flex gap-2 pointer-events-auto">
              <button
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg',
                  videoProgress[currentVideo.id]
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-en-500/80 text-white hover:bg-en-600 border border-en-400/30',
                ]"
                @click="markAsWatched"
              >
                {{ videoProgress[currentVideo.id] ? '✅ 已学完' : '📌 标记完成' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs area -->
        <div class="flex-1 flex flex-col bg-white/5 backdrop-blur-sm overflow-hidden">
          <!-- Tab bar -->
          <div class="flex items-center border-b border-white/10 px-4 flex-shrink-0">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="px-5 py-3 text-xs font-bold transition-all relative"
              :class="activeTab === tab.key ? 'text-en-400' : 'text-white/40 hover:text-white/70'"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
              <div
                v-if="activeTab === tab.key"
                class="absolute bottom-0 left-4 right-4 h-0.5 bg-en-500 rounded-full"
              />
            </button>
          </div>

          <!-- Tab content -->
          <div class="flex-1 overflow-y-auto p-4">
            <!-- Notes Tab -->
            <div v-if="activeTab === 'notes'" class="h-full flex flex-col">
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-xs font-bold text-white/50 uppercase tracking-wider">课程笔记</h3>
                <span class="text-[10px] text-emerald-400 transition-opacity" :class="savedIndicator ? 'opacity-100' : 'opacity-0'">
                  ✅ 已保存
                </span>
              </div>
              <textarea
                v-model="currentNotes"
                placeholder="在此记录课程重点内容..."
                class="flex-1 w-full p-4 bg-black/30 border border-white/10 rounded-xl text-sm text-white/80 placeholder-white/20 resize-none focus:ring-1 focus:ring-en-500 outline-none transition-all"
                @input="autoSaveNotes"
              />
            </div>

            <!-- AI Chat Tab -->
            <div v-if="activeTab === 'chat'" class="h-full flex flex-col">
              <!-- No API Key configured -->
              <div v-if="!hasApiKey()" class="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div class="w-20 h-20 rounded-full bg-gradient-to-br from-en-500/20 to-en-cyan-500/20 border border-en-500/30 flex items-center justify-center text-4xl mb-5">
                  🤖
                </div>
                <h3 class="text-lg font-bold text-white/80 mb-2">接入通义千问大模型</h3>
                <p class="text-sm text-white/40 leading-relaxed max-w-md mb-6">
                  配置 API Key 后即可使用 AI 答疑功能，获得更精准的英语学习解答
                </p>
                <button
                  class="px-6 py-3 bg-gradient-to-r from-en-600 to-en-cyan-500 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                  @click="openApiKeyModal"
                >
                  ⚙️ 配置 API Key
                </button>
                <p class="text-[10px] text-white/20 mt-4">
                  API Key 仅存储在本地浏览器，不会上传到服务器
                </p>
              </div>

              <!-- Chat interface -->
              <template v-else>
                <div ref="chatBox" class="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                  <div
                    v-for="(msg, idx) in chatMessages"
                    :key="idx"
                    :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']"
                  >
                    <div
                      :class="[
                        'max-w-[85%] p-3.5 text-sm leading-relaxed whitespace-pre-wrap',
                        msg.role === 'user'
                          ? 'bg-en-600 text-white rounded-2xl rounded-br-md'
                          : 'bg-zinc-800 text-zinc-200 rounded-2xl rounded-bl-md border border-zinc-700/50',
                      ]"
                    >
                      {{ msg.content }}
                      <span v-if="idx === chatMessages.length - 1 && isAiTyping && msg.role === 'ai'" class="inline-block w-1.5 h-4 bg-en-400 ml-0.5 animate-pulse" />
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                  <input
                    v-model="chatInput"
                    :placeholder="isAiTyping ? 'AI 正在组织语言...' : '输入语法问题，AI 为你解答...'"
                    class="flex-1 p-3 bg-black/30 border border-white/10 rounded-xl text-sm text-white/80 placeholder-white/20 focus:ring-1 focus:ring-en-500 outline-none transition-all"
                    :disabled="isAiTyping"
                    @keyup.enter="sendChatMessage"
                  />
                  <button
                    class="px-5 py-3 bg-en-600 text-white rounded-xl font-bold text-sm hover:bg-en-700 transition-all shadow-lg disabled:opacity-50"
                    :disabled="!chatInput.trim() || isAiTyping"
                    @click="sendChatMessage"
                  >
                    {{ isAiTyping ? '...' : '发送' }}
                  </button>
                </div>
              </template>
            </div>

            <!-- Related Tab -->
            <div v-if="activeTab === 'related'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="(video, idx) in relatedVideos"
                :key="video.id"
                :class="`delay-${idx % 6}`"
                class="group bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 p-4 cursor-pointer transition-all hover:scale-[1.02] animate-fade-in-up opacity-0"
                @click="selectVideo(video, video.category)"
              >
                <div class="w-full aspect-video bg-gradient-to-br from-en-500/10 to-en-cyan-500/10 rounded-lg mb-3 flex items-center justify-center">
                  <span class="text-3xl">🎬</span>
                </div>
                <h4 class="text-sm font-bold text-white/80 group-hover:text-white transition-colors mb-1">{{ video.title }}</h4>
                <div class="flex items-center justify-between">
                  <span class="text-[10px] text-white/30">{{ video.category }}</span>
                  <span class="text-[10px] text-orange-400">🔥 {{ Math.floor(Math.random() * 50 + 10) }} 人正在学</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dictionary Lookup Panel -->
      <DictionaryLookup :visible="showDictPanel" :word="dictWord" @close="showDictPanel = false" />
    </div>

    <!-- Quiz Modal -->
    <Transition name="modal">
      <div
        v-if="quizVisible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        @click.self="quizVisible = false"
      >
        <div class="bg-zinc-900 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden">
          <div class="p-6 border-b border-zinc-800 bg-gradient-to-r from-en-600 to-en-cyan-500 text-white flex items-center justify-between">
            <h3 class="font-bold flex items-center gap-2">📝 课后小测</h3>
            <button class="text-white/60 hover:text-white transition-colors text-xl" @click="quizVisible = false">✕</button>
          </div>
          <div class="p-6 space-y-6 max-h-[50vh] overflow-y-auto">
            <div v-for="(item, index) in currentVideo.questions" :key="index" class="space-y-3">
              <p class="font-bold text-white text-sm">{{ index + 1 }}. {{ item.q }}</p>
              <div class="grid grid-cols-2 gap-3">
                <button
                  v-for="opt in item.options"
                  :key="opt"
                  :class="[
                    'p-3 text-xs border rounded-xl text-left transition-all font-medium',
                    quizAnswers[index] === opt
                      ? 'bg-en-600 border-en-500 text-white'
                      : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-en-500/50',
                  ]"
                  @click="quizAnswers[index] = opt"
                >
                  {{ opt }}
                </button>
              </div>
            </div>
          </div>
          <div class="p-4 flex justify-end gap-3 border-t border-zinc-800 bg-zinc-900/50">
            <button class="px-4 py-2 text-zinc-400 text-sm font-bold hover:text-white transition-colors" @click="quizVisible = false">
              取消
            </button>
            <button
              class="px-6 py-2 bg-en-600 text-white rounded-xl font-bold text-sm hover:bg-en-700 transition-all shadow-lg"
              @click="submitQuiz"
            >
              提交答案
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- API Key Modal -->
    <Transition name="modal">
      <div
        v-if="showApiKeyModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        @click.self="showApiKeyModal = false"
      >
        <div class="bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-800 overflow-hidden">
          <div class="p-6 border-b border-zinc-800 bg-gradient-to-r from-en-600 to-en-cyan-500 text-white flex items-center justify-between">
            <h3 class="font-bold flex items-center gap-2">⚙️ 配置 API Key</h3>
            <button class="text-white/60 hover:text-white transition-colors text-xl" @click="showApiKeyModal = false">✕</button>
          </div>
          <div class="p-6 space-y-4">
            <div class="bg-en-500/10 border border-en-500/20 rounded-xl p-4 text-sm text-en-300 leading-relaxed">
              <p class="font-bold mb-1">🔑 通义千问 API Key</p>
              <p class="text-xs text-en-400/60">前往 <a class="text-en-300 underline" href="https://help.aliyun.com/zh/model-studio/developer-reference/get-api-key" target="_blank">阿里云模型服务灵积</a> 获取，API Key 仅存储在本地浏览器。</p>
            </div>
            <div>
              <label class="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 block">API Key</label>
              <input
                v-model="apiKeyInput"
                type="password"
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                class="w-full p-3 bg-black/40 border border-zinc-700 rounded-xl text-sm text-white/80 placeholder-white/20 focus:ring-1 focus:ring-en-500 outline-none transition-all font-mono"
              />
            </div>
          </div>
          <div class="p-4 flex justify-end gap-3 border-t border-zinc-800 bg-zinc-900/50">
            <button
              class="px-4 py-2 text-zinc-400 text-sm font-bold hover:text-white transition-colors"
              @click="showApiKeyModal = false"
            >
              取消
            </button>
            <button
              class="px-6 py-2 bg-gradient-to-r from-en-600 to-en-cyan-500 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all shadow-lg"
              @click="confirmApiKey"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import '../shared/animations.css';
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';
import { useGamification } from '../shared/use-gamification';
import type { CourseVideo, ChatMessage } from '../shared/types';
import { XpBar, DictionaryLookup } from '../components';
import { hasApiKey, setApiKey as saveApiKey, loadApiKey, sendChatMessage as aiChat } from '../shared/use-ai-chat';

const gamification = useGamification();

// --- Sidebar ---
const sidebarOpen = ref(true);

// --- Video catalog ---
interface VideoItem extends CourseVideo {
  bvid: string;
}

const videoDict: Record<string, VideoItem[]> = {
  '高考英语': [
    { id: 'gaokao-1', title: '核心语法特训', bvid: 'BV1XY411J7aG', category: '高考英语', duration: '45:00', questions: [
      { q: 'It is ______ that he will win the game.', options: ['likely', 'possible', 'probably', 'perhaps'], answer: 'likely' },
      { q: 'He suggested that we ______ the plan.', options: ['changed', 'change', 'should changed', 'changing'], answer: 'change' },
    ]},
    { id: 'gaokao-2', title: '完形填空提分技巧', bvid: 'BV1vZnjzgEMY', category: '高考英语', duration: '38:00', questions: [] },
  ],
  '四六级英语': [
    { id: 'cet-1', title: '四级听力必背词汇', bvid: 'BV1ZJVuzqELs', category: '四六级英语', duration: '52:00', questions: [] },
    { id: 'cet-2', title: '六级写作高分模板', bvid: 'BV1BG411N7xr', category: '四六级英语', duration: '41:00', questions: [] },
  ],
  '考研英语': [
    { id: 'kaoyan-1', title: '长难句逻辑拆解', bvid: 'BV1nXARzjE6k', category: '考研英语', duration: '55:00', questions: [] },
    { id: 'kaoyan-2', title: '考研阅读真题精讲', bvid: 'BV1oDgrzREbD', category: '考研英语', duration: '48:00', questions: [] },
  ],
};

const currentCategory = ref('高考英语');
const defaultVideo = (videoDict['高考英语'] as VideoItem[])[0] as VideoItem;
const currentVideo = ref<VideoItem>(defaultVideo);

const totalVideos = computed(() =>
  Object.values(videoDict).flat().length
);

// --- Video progress ---
const videoProgress = ref<Record<string, boolean>>(loadProgress());

function loadProgress(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem('en-video-watched') || '{}');
  } catch { return {}; }
}

function saveProgress() {
  localStorage.setItem('en-video-watched', JSON.stringify(videoProgress.value));
}

const totalWatched = computed(() =>
  Object.values(videoProgress.value).filter(Boolean).length
);

function markAsWatched() {
  if (videoProgress.value[currentVideo.value.id]) {
    // Already watched - unmark
    videoProgress.value[currentVideo.value.id] = false;
  } else {
    videoProgress.value[currentVideo.value.id] = true;
    gamification.addXp(50);
  }
  saveProgress();
}

function selectVideo(video: VideoItem, category: string) {
  currentVideo.value = video;
  currentCategory.value = category;
  activeTab.value = 'notes';
  // Load notes for new video
  loadNotes();
  loadChatHistory();
}

// --- Notes ---
const currentNotes = ref('');
const savedIndicator = ref(false);
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function loadNotes() {
  try {
    const saved = localStorage.getItem(`en-notes-${currentVideo.value.id}`);
    currentNotes.value = saved || '';
  } catch { currentNotes.value = ''; }
}

function autoSaveNotes() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(`en-notes-${currentVideo.value.id}`, currentNotes.value);
      savedIndicator.value = true;
      setTimeout(() => { savedIndicator.value = false; }, 2000);
    } catch {}
  }, 500);
}

// --- Chat ---
const chatBox = ref<HTMLElement | null>(null);
const chatInput = ref('');
const isAiTyping = ref(false);
const chatMessages = ref<ChatMessage[]>([]);
const apiKeyInput = ref('');
const showApiKeyModal = ref(false);

// Load API key on mount
loadApiKey();

function loadChatHistory() {
  try {
    const saved = localStorage.getItem(`en-chat-${currentVideo.value.id}`);
    if (saved) {
      chatMessages.value = JSON.parse(saved);
    } else {
      chatMessages.value = [
        { role: 'ai', content: '你好！我是智启 AI，接入通义千问大模型。关于本节课的语法问题，随时问我！' },
      ];
    }
  } catch {
    chatMessages.value = [
      { role: 'ai', content: '你好！我是智启 AI，接入通义千问大模型。关于本节课的语法问题，随时问我！' },
    ];
  }
}

function saveChatHistory() {
  try {
    localStorage.setItem(`en-chat-${currentVideo.value.id}`, JSON.stringify(chatMessages.value));
  } catch {}
}

async function sendChatMessage() {
  const text = chatInput.value.trim();
  if (!text || isAiTyping.value) return;

  if (!hasApiKey()) {
    showApiKeyModal.value = true;
    return;
  }

  chatMessages.value.push({ role: 'user', content: text });
  chatInput.value = '';
  isAiTyping.value = true;

  // Add a placeholder AI message for streaming
  chatMessages.value.push({ role: 'ai', content: '' });
  scrollChat();

  const userMessages = chatMessages.value.slice(0, -1); // exclude the placeholder

  await aiChat(
    userMessages,
    (partial) => {
      // Update the last AI message with partial content
      const lastMsg = chatMessages.value[chatMessages.value.length - 1];
      if (lastMsg && lastMsg.role === 'ai') lastMsg.content = partial;
      scrollChat();
    },
    (fullText) => {
      isAiTyping.value = false;
      if (!fullText) {
        chatMessages.value.pop(); // remove empty message
      }
      saveChatHistory();
      scrollChat();
    },
    (error) => {
      isAiTyping.value = false;
      chatMessages.value.pop(); // remove the empty placeholder
      message.error(error || 'AI 回复失败，请重试');
    },
  );
}

function openApiKeyModal() {
  apiKeyInput.value = loadApiKey();
  showApiKeyModal.value = true;
}

function confirmApiKey() {
  const key = apiKeyInput.value.trim();
  if (!key) {
    message.warning('请输入 API Key');
    return;
  }
  saveApiKey(key);
  showApiKeyModal.value = false;
  message.success('API Key 已保存');
}

function scrollChat() {
  nextTick(() => {
    if (chatBox.value) {
      chatBox.value.scrollTop = chatBox.value.scrollHeight;
    }
  });
}

// --- Quiz ---
const quizVisible = ref(false);
const quizAnswers = ref<Record<number, string>>({});
const tabs = [
  { key: 'notes', label: '📝 课程笔记' },
  { key: 'chat', label: '🤖 AI 答疑' },
  { key: 'related', label: '🎯 相关推荐' },
];
const activeTab = ref('notes');

const relatedVideos = computed<VideoItem[]>(() => {
  return Object.entries(videoDict)
    .flatMap(([cat, videos]) => videos.map(v => ({ ...v, category: cat })))
    .filter(v => v.id !== currentVideo.value.id)
    .slice(0, 6);
});

function submitQuiz() {
  const qs = currentVideo.value.questions;
  if (Object.keys(quizAnswers.value).length < qs.length) return;

  let score = 0;
  qs.forEach((item, index) => {
    if (quizAnswers.value[index] === item.answer) score++;
  });

  if (score === qs.length) {
    gamification.unlockAchievement('quiz-master');
  }

  gamification.addXp(score * 10);
  quizVisible.value = false;
}

// --- Dictionary ---
const showDictPanel = ref(false);
const dictWord = ref('');

// --- Keyboard shortcut: Ctrl+K to open dictionary ---
function handleKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    showDictPanel.value = !showDictPanel.value;
  }
}

onMounted(() => {
  loadNotes();
  loadChatHistory();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* Dark theme scrollbars */
.overflow-y-auto::-webkit-scrollbar { width: 4px; }
.overflow-y-auto::-webkit-scrollbar-thumb { background-color: rgba(255,255,255,0.1); border-radius: 10px; }
.overflow-y-auto::-webkit-scrollbar-track { background: transparent; }

/* Modal transition */
.modal-enter-active { transition: all 0.3s ease-out; }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > div, .modal-leave-to > div { transform: scale(0.9); }
</style>
