<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-50/30 to-stone-50/30 dark:from-[#09090b] dark:via-[#0c0c1d] dark:to-[#0d0d14] p-5">
    <!-- Decorative bg -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden -z-0">
      <div class="absolute top-20 right-20 w-80 h-80 bg-sg-accent/5 rounded-full blur-3xl" />
      <div class="absolute bottom-40 left-10 w-96 h-96 bg-sg-primary/4 rounded-full blur-3xl" />
    </div>

    <div class="max-w-7xl mx-auto relative z-10 space-y-5">
      <!-- ===== Welcome Hero ===== -->
      <div class="relative overflow-hidden bg-gradient-to-r from-sg-primary to-sg-accent rounded-2xl p-6 text-white shadow-xl">
        <div class="relative z-10">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl shadow-lg">
                🎓
              </div>
              <div>
                <h1 class="text-xl font-black tracking-tight">
                  👋 欢迎回来，今日学习 {{ studyMinutesToday }} 分钟
                </h1>
                <p class="text-white/70 text-sm font-medium">
                  平台 Lv.{{ platformLevel }} · 连续学习 {{ maxStreak }} 天
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20 text-center">
                <div class="text-[10px] uppercase tracking-wider opacity-70 font-bold">平台等级</div>
                <div class="text-lg font-black">Lv.{{ platformLevel }}</div>
              </div>
              <div class="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20 text-center">
                <div class="text-[10px] uppercase tracking-wider opacity-70 font-bold">累计 XP</div>
                <div class="text-lg font-black">{{ xpDisplay }}</div>
              </div>
            </div>
          </div>
          <div class="mt-4 max-w-lg">
            <div class="flex justify-between text-xs text-white/70 mb-1">
              <span class="font-bold">平台经验值</span>
              <span class="font-mono">{{ totalXp }} / {{ nextLevelXp }} XP</span>
            </div>
            <div class="h-2.5 bg-white/20 rounded-full overflow-hidden shadow-inner">
              <div
                class="h-full rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-1000"
                :style="{ width: levelProgress + '%' }"
              />
            </div>
          </div>
        </div>
        <div class="absolute -bottom-4 -right-4 opacity-10">
          <span class="text-[120px]">🚀</span>
        </div>
      </div>

      <!-- ===== Module Stats Row ===== -->
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="mod in moduleStats"
          :key="mod.name"
          class="rounded-xl border p-4 shadow-sm transition-all hover:shadow-md"
          :class="mod.bg"
          :style="{ borderColor: 'transparent' }"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-white/80 dark:bg-zinc-800/80 shadow-sm">
              {{ mod.name === '智慧英语' ? '📝' : '📜' }}
            </div>
            <div class="flex-1">
              <div class="text-xs font-medium text-gray-500 dark:text-zinc-400">{{ mod.name }}</div>
              <div class="flex items-center gap-3 mt-0.5">
                <span class="text-sm font-black text-gray-900 dark:text-white">{{ mod.xp }} XP</span>
                <span class="text-xs text-gray-400">🔥 {{ mod.streak }} 天</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Main Grid ===== -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Left: 2/3 -->
        <div class="lg:col-span-2 space-y-5">
          <!-- Focus Room -->
          <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-sg-accent rounded-full" />
                🍅 番茄专注
              </h3>
              <span class="text-[10px] text-gray-400 font-mono">今日 {{ focusCount }} 次</span>
            </div>

            <div class="flex flex-col items-center">
              <!-- SVG ring timer -->
              <div class="relative w-36 h-36 mb-4">
                <svg class="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" stroke-width="6" class="dark:stroke-zinc-700" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="url(#focusGrad)"
                    stroke-width="6"
                    stroke-linecap="round"
                    :stroke-dasharray="focusCircumference"
                    :stroke-dashoffset="focusOffset"
                    class="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#4F46E5" />
                      <stop offset="100%" stop-color="#06B6D4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-3xl font-black text-gray-900 dark:text-white tabular-nums">{{ focusDisplay }}</span>
                  <span class="text-[10px] text-gray-400 font-medium">{{ focusStatusText }}</span>
                </div>
              </div>

              <!-- Controls -->
              <div class="flex items-center gap-3">
                <button
                  v-if="!focusRunning && !focusPaused"
                  class="w-12 h-12 rounded-full bg-gradient-to-r from-sg-primary to-sg-accent text-white flex items-center justify-center text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                  @click="startFocus"
                >▶</button>
                <button
                  v-if="focusRunning"
                  class="w-12 h-12 rounded-full bg-zinc-1000 text-white flex items-center justify-center text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                  @click="pauseFocus"
                >⏸</button>
                <button
                  v-if="focusPaused"
                  class="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                  @click="resumeFocus"
                >▶</button>
                <button
                  v-if="focusRunning || focusPaused"
                  class="w-12 h-12 rounded-full bg-slate-200 dark:bg-zinc-700 text-gray-400 flex items-center justify-center text-lg hover:bg-slate-300 dark:hover:bg-zinc-600 transition-all"
                  @click="resetFocus"
                >⏹</button>
              </div>

              <!-- Mode selector -->
              <div class="flex gap-2 mt-4">
                <button
                  v-for="mode in focusModes"
                  :key="mode.value"
                  class="px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all"
                  :class="focusMode === mode.value ? 'bg-sg-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'"
                  @click="setFocusMode(mode.value)"
                >
                  {{ mode.label }}
                </button>
              </div>

              <div v-if="focusComplete" class="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-bounce">
                🎉 专注完成！+20 XP
              </div>
            </div>
          </div>

          <!-- Recent Learning & AI Coach -->
          <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
            <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-sg-primary rounded-full" />
              📚 学习概览
            </h3>
            <div class="space-y-3">
              <div
                v-for="(item, idx) in recentActivity"
                :key="idx"
                class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div
                  class="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-sm"
                  :class="item.module === 'en' ? 'bg-en-50 dark:bg-en-500/10' : 'bg-violet-50 dark:bg-violet-500/10'"
                >
                  {{ item.icon }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-bold text-gray-800 dark:text-zinc-200">{{ item.label }}</div>
                </div>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  :class="item.module === 'en'
                    ? 'text-en-600 dark:text-en-400 bg-en-50 dark:bg-en-500/10'
                    : 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10'"
                >
                  {{ item.time }}
                </span>
              </div>
              <div v-if="recentActivity.length === 0" class="text-center py-6 text-gray-400 text-sm">
                还没有学习数据，开始学习吧！
              </div>
            </div>
          </div>

          <!-- Weekly Chart -->
          <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-sg-primary rounded-full" />
                📈 本周学习分析
              </h3>
              <div class="flex items-center gap-3 text-[10px] text-gray-400">
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm" :style="{ backgroundColor: '#4F46E5' }" /> 英语</span>
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm" :style="{ backgroundColor: '#7C3AED' }" /> 文学</span>
              </div>
            </div>
            <EchartsUI ref="weeklyChartRef" height="200px" />
          </div>

          <!-- Learning Heatmap -->
          <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-orange-500 rounded-full" />
                🔥 学习热力图
              </h3>
              <span class="text-[10px] text-gray-400">{{ heatmapYear }}</span>
            </div>
            <div class="flex flex-wrap gap-0.5 justify-center">
              <div
                v-for="(day, di) in heatmapDays"
                :key="di"
                class="w-2.5 h-2.5 rounded-sm transition-colors cursor-default"
                :title="day.label"
                :style="{ backgroundColor: day.color }"
              />
            </div>
            <div class="flex items-center justify-end gap-1 mt-2 text-[9px] text-gray-400">
              <span>少</span>
              <span class="w-2.5 h-2.5 rounded-sm" style="background: #1a1a2e;" />
              <span class="w-2.5 h-2.5 rounded-sm" style="background: #0e4429;" />
              <span class="w-2.5 h-2.5 rounded-sm" style="background: #006d32;" />
              <span class="w-2.5 h-2.5 rounded-sm" style="background: #26a641;" />
              <span class="w-2.5 h-2.5 rounded-sm" style="background: #39d353;" />
              <span>多</span>
            </div>
          </div>

          <!-- Weekly Report -->
          <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-blue-500 rounded-full" />
                📋 学习报告周报
              </h3>
              <button class="px-3 py-1 text-[10px] font-bold rounded-lg bg-sg-primary text-white hover:opacity-90 transition" @click="generateWeeklyReport">生成周报</button>
            </div>
            <div v-if="weeklyReport" class="space-y-2 text-xs animate-fade-in-up">
              <div class="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-900">
                <span class="text-gray-500">学习时长</span>
                <span class="font-bold text-gray-800 dark:text-zinc-200">{{ weeklyReport.hours }} 小时</span>
              </div>
              <div class="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-900">
                <span class="text-gray-500">完成任务</span>
                <span class="font-bold text-gray-800 dark:text-zinc-200">{{ weeklyReport.tasksCompleted }} 个</span>
              </div>
              <div class="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-900">
                <span class="text-gray-500">新增 XP</span>
                <span class="font-bold text-emerald-600">+{{ weeklyReport.newXp }}</span>
              </div>
              <div class="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-900">
                <span class="text-gray-500">能力增长</span>
                <span class="font-bold text-blue-600">+{{ weeklyReport.growth }}%</span>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-400 text-xs">点击"生成周报"获取本周学习总结</div>
          </div>
        </div>

        <!-- Right: 1/3 -->
        <div class="space-y-5">
          <!-- AI Coach -->
          <div class="bg-gradient-to-br from-sg-primary/5 to-sg-accent/5 dark:from-sg-primary/10 dark:to-sg-accent/10 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <h3 class="text-xs font-black uppercase tracking-widest text-gray-800 dark:text-zinc-100">🤖 AI 学习秘书</h3>
            </div>
            <p class="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
              {{ aiSecretaryMessage }}
            </p>
            <div class="mt-4 flex gap-2 flex-wrap">
              <button
                v-for="action in quickActions"
                :key="action.label"
                class="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:border-sg-primary hover:text-sg-primary dark:hover:text-sg-accent transition-all"
                @click="navigateTo(action.path)"
              >
                {{ action.icon }} {{ action.label }}
              </button>
            </div>
          </div>

          <!-- Daily Tasks -->
          <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-emerald-500 rounded-full" />
                ✅ 今日任务
              </h3>
              <span class="text-[10px] text-gray-400">{{ completedTasks }}/{{ dailyTasks.length }} 已完成</span>
            </div>
            <div class="space-y-2">
              <div v-for="(task, i) in dailyTasks" :key="i" class="flex items-center gap-3 p-2.5 rounded-xl transition-colors" :class="task.done ? 'bg-emerald-50 dark:bg-emerald-500/5' : 'bg-slate-50 dark:bg-zinc-900/50'" @click="toggleTask(i)">
                <div class="w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all" :class="task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-zinc-600'" style="font-size: 10px;">
                  {{ task.done ? '✓' : '' }}
                </div>
                <div class="flex-1">
                  <span class="text-xs font-medium" :class="task.done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-zinc-300'">{{ task.label }}</span>
                  <span class="text-[10px] text-gray-400 ml-2">+{{ task.xp }} XP</span>
                </div>
                <span class="text-lg">{{ task.icon }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
            <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-sg-accent rounded-full" />
              ⚡ 快速统计
            </h3>
            <div class="space-y-3">
              <div
                v-for="stat in quickStats"
                :key="stat.label"
                class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/50"
              >
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ stat.icon }}</span>
                  <span class="text-xs font-bold text-gray-600 dark:text-zinc-400">{{ stat.label }}</span>
                </div>
                <span class="text-sm font-black text-gray-900 dark:text-white tabular-nums">{{ stat.value }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Notes -->
          <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-zinc-1000 rounded-full" />
                📝 我的笔记
              </h3>
            </div>
            <div class="space-y-2">
              <div
                v-for="(note, idx) in notes"
                :key="idx"
                class="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/50 group cursor-pointer"
                :class="note.type === 'pdf' ? 'hover:bg-en-50 dark:hover:bg-en-500/5 border border-transparent hover:border-en-200 dark:hover:border-en-500/20' : ''"
                @click="note.type === 'pdf' ? openPdfNote(note) : undefined"
              >
                <span class="text-sm flex-shrink-0 mt-0.5">{{ note.type === 'pdf' ? '📄' : note.icon }}</span>
                <div class="flex-1 min-w-0">
                  <p v-if="note.type === 'pdf'" class="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate">{{ note.pdfName }}</p>
                  <p v-else class="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">{{ note.text }}</p>
                  <span class="text-[10px] text-gray-400 mt-1 block">
                    {{ note.date }}
                    <span v-if="note.type === 'pdf' && note.pdfSize" class="ml-1">· {{ formatFileSize(note.pdfSize) }}</span>
                  </span>
                </div>
                <button
                  class="text-gray-300 dark:text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs flex-shrink-0"
                  @click.stop="removeNote(idx)"
                >
                  ✕
                </button>
              </div>
              <div v-if="notes.length === 0" class="text-center py-6 text-gray-400 text-xs">
                还没有笔记
              </div>
            </div>
            <!-- Add note + import PDF -->
            <div class="mt-3 pt-3 border-t border-dashed dark:border-zinc-800 space-y-2">
              <div class="flex gap-2">
                <input
                  v-model="newNoteText"
                  placeholder="记录学习心得..."
                  class="flex-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 focus:ring-1 focus:ring-sg-primary outline-none transition-all"
                  @keyup.enter="addNote"
                />
                <button
                  class="px-4 py-2 bg-sg-primary text-white text-xs rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-40"
                  :disabled="!newNoteText.trim()"
                  @click="addNote"
                >
                  添加
                </button>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
                <span class="text-[10px] text-gray-400 font-medium">或</span>
                <div class="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
              </div>
              <button
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border-2 border-dashed border-gray-300 dark:border-zinc-600 text-gray-500 dark:text-zinc-400 hover:border-sg-primary hover:text-sg-primary dark:hover:border-sg-accent dark:hover:text-sg-accent transition-all"
                :disabled="pdfImporting"
                @click="triggerPdfInput"
              >
                <span v-if="pdfImporting" class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span v-else>📄</span>
                {{ pdfImporting ? '正在导入...' : '导入电脑上的 PDF 文件' }}
              </button>
              <input
                ref="pdfInputRef"
                type="file"
                accept=".pdf"
                class="hidden"
                @change="handlePdfImport"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import './sg-tokens.css';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import type { EchartsUIType } from '@vben/plugins/echarts';
import { message } from 'ant-design-vue';
import { useSgProfile } from '../shared-learning/composables/use-sg-profile';

const router = useRouter();
const sg = useSgProfile();

// ── Expose aggregated profile data ──
const {
  totalXp, maxStreak, studyMinutesToday, platformLevel,
  nextLevelXp, levelProgress, recentActivity, moduleStats,
} = sg;

const xpDisplay = computed(() => {
  const v = totalXp.value;
  return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);
});

// ── Focus Timer ──
const FOCUS_OPTIONS = [25, 45, 60] as const;
const focusModes = [
  { value: 25, label: '25 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
];

const focusMode = ref<number>(25);
const focusSeconds = ref(25 * 60);
const focusRunning = ref(false);
const focusPaused = ref(false);
const focusComplete = ref(false);
const focusCount = ref(loadFocusCount());
const focusCircumference = 2 * Math.PI * 50;
let focusTimer: ReturnType<typeof setInterval> | null = null;

const focusDisplay = computed(() => {
  const m = Math.floor(focusSeconds.value / 60);
  const s = focusSeconds.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

const focusOffset = computed(() => {
  const progress = focusSeconds.value / (focusMode.value * 60);
  return focusCircumference * (1 - progress);
});

const focusStatusText = computed(() => {
  if (focusRunning.value) return '专注中...';
  if (focusPaused.value) return '已暂停';
  return '准备就绪';
});

function loadFocusCount(): number {
  try {
    const today = new Date().toISOString().split('T')[0];
    const raw = localStorage.getItem('sg-focus-count');
    if (!raw) return 0;
    const data = JSON.parse(raw);
    return data.date === today ? data.count : 0;
  } catch { return 0; }
}

function saveFocusCount(count: number) {
  try {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('sg-focus-count', JSON.stringify({ date: today, count }));
  } catch { /* ignore */ }
}

function setFocusMode(mode: number) {
  if (focusRunning.value || focusPaused.value) return;
  focusMode.value = mode;
  focusSeconds.value = mode * 60;
}

function startFocus() {
  focusRunning.value = true;
  focusPaused.value = false;
  focusComplete.value = false;
  focusTimer = setInterval(() => {
    focusSeconds.value--;
    if (focusSeconds.value <= 0) {
      focusSeconds.value = 0;
      completeFocus();
    }
  }, 1000);
}

function pauseFocus() {
  focusRunning.value = false;
  focusPaused.value = true;
  if (focusTimer) clearInterval(focusTimer);
}

function resumeFocus() {
  focusRunning.value = true;
  focusPaused.value = false;
  focusTimer = setInterval(() => {
    focusSeconds.value--;
    if (focusSeconds.value <= 0) {
      focusSeconds.value = 0;
      completeFocus();
    }
  }, 1000);
}

function resetFocus() {
  focusRunning.value = false;
  focusPaused.value = false;
  focusComplete.value = false;
  if (focusTimer) clearInterval(focusTimer);
  focusSeconds.value = focusMode.value * 60;
}

function completeFocus() {
  if (focusTimer) clearInterval(focusTimer);
  focusRunning.value = false;
  focusPaused.value = false;
  focusComplete.value = true;
  focusCount.value++;
  saveFocusCount(focusCount.value);
  setTimeout(() => {
    focusComplete.value = false;
    focusSeconds.value = focusMode.value * 60;
  }, 3000);
}

onUnmounted(() => {
  if (focusTimer) clearInterval(focusTimer);
});

// ── AI Coach ──
const aiSuggestion = computed(() => {
  const en = moduleStats.value.find(m => m.name === '智慧英语');
  const zh = moduleStats.value.find(m => m.name === '文学素养');
  const hasEn = (en?.xp ?? 0) > 0;
  const hasZh = (zh?.xp ?? 0) > 0;

  if (!hasEn && !hasZh) return '欢迎来到学习中心！从英语或文学模块开始你的学习之旅吧。';
  if (!hasZh) return '英语学习进度良好，建议同时开始文学素养学习，全面发展人文素养。';
  if (!hasEn) return '文学学习进度良好，建议加入英语学习模块，提升综合语言能力。';
  if (platformLevel.value >= 5) return '你已经是一名资深学习者了！尝试更高难度的挑战，或者通过 PDF 工作区深化知识。';
  return '保持每日学习节奏，持续积累是进步的关键。建议双模块交替学习以提高效率。';
});

const aiSecretaryMessage = computed(() => {
  const msgs = [
    '今日学习状态良好！建议优先完成英语听力训练，你已经连续3天未进行听力练习了。',
    '你的文学素养模块进展顺利，今天尝试完成一篇学术写作练习吧。',
    '检测到词汇复习任务积压，建议先花15分钟完成艾宾浩斯复习。',
    '周末学习效率最高！抓住黄金时间完成本周未达标的学习目标。',
    '继续保持每日打卡的节奏，距离下一个成就只差30 XP了！',
  ];
  return msgs[new Date().getDate() % msgs.length];
});

interface DailyTask { icon: string; label: string; xp: number; done: boolean }
const dailyTasks = ref<DailyTask[]>(loadDailyTasks());
const completedTasks = computed(() => dailyTasks.value.filter(t => t.done).length);
function loadDailyTasks(): DailyTask[] {
  try {
    const today = new Date().toISOString().split('T')[0];
    const raw = localStorage.getItem('sg-daily-tasks');
    if (raw) { const data = JSON.parse(raw); if (data.date === today) return data.tasks; }
  } catch {}
  return [
    { icon: '📜', label: '背诵诗词一首', xp: 15, done: false },
    { icon: '📖', label: '阅读古文一篇', xp: 15, done: false },
    { icon: '📝', label: '完成词汇测试', xp: 20, done: false },
    { icon: '💬', label: 'AI 对话练习 10 分钟', xp: 25, done: false },
  ];
}
function saveDailyTasks() { try { const today = new Date().toISOString().split('T')[0]; localStorage.setItem('sg-daily-tasks', JSON.stringify({ date: today, tasks: dailyTasks.value })); } catch {} }
function toggleTask(i: number) { dailyTasks.value[i].done = !dailyTasks.value[i].done; saveDailyTasks(); }

const heatmapYear = new Date().getFullYear();
const heatmapDays = computed(() => {
  const days: Array<{ label: string; color: string }> = [];
  const now = new Date();
  for (let i = 180; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const hours = Math.random();
    let color = '#1a1a2e';
    if (hours > 0.8) color = '#39d353'; else if (hours > 0.6) color = '#26a641'; else if (hours > 0.4) color = '#006d32'; else if (hours > 0.2) color = '#0e4429';
    days.push({ label: key, color });
  }
  return days;
});

const weeklyReport = ref<{ hours: number; tasksCompleted: number; newXp: number; growth: number } | null>(null);
function generateWeeklyReport() { weeklyReport.value = { hours: 8.2 + Math.floor(Math.random() * 3), tasksCompleted: 32 + Math.floor(Math.random() * 10), newXp: 1450 + Math.floor(Math.random() * 500), growth: 12 + Math.floor(Math.random() * 10) }; }

const quickActions = [
  { icon: '📝', label: '英语写作', path: '/english-learning/essay' },
  { icon: '📜', label: '诗词鉴赏', path: '/chinese-learning/poetry' },
  { icon: '📖', label: '古文阅读', path: '/chinese-learning/literacy' },
  { icon: '🎧', label: '听力训练', path: '/english-learning/listening' },
];

function navigateTo(path: string) {
  router.push(path);
}

// ── Quick Stats ──
const quickStats = computed(() => [
  { icon: '📝', label: '英语 XP', value: `${sg.enXp.value}` },
  { icon: '📜', label: '文学 XP', value: `${sg.zhXp.value}` },
  { icon: '🔥', label: '最长打卡', value: `${maxStreak.value} 天` },
  { icon: '🏆', label: '累计成就', value: `${sg.totalAchievements.value}` },
  { icon: '⏱', label: '累计学习', value: `${sg.totalStudyHours.value} h` },
]);

// ── Weekly Chart ──
const weeklyChartRef = ref<EchartsUIType>();
const { renderEcharts: renderWeekly } = useEcharts(weeklyChartRef);

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const enWeeklyData = [45, 30, 60, 78, 90, 120, 55];
const zhWeeklyData = [20, 35, 15, 42, 55, 30, 25];

onMounted(() => {
  renderWeekly({
    grid: { left: '2%', right: '2%', bottom: '2%', containLabel: true },
    legend: { show: false },
    xAxis: {
      type: 'category',
      data: weekDays,
      axisLabel: { fontSize: 10, color: '#999' },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitNumber: 3,
      axisLabel: { fontSize: 9, color: '#999' },
      splitLine: { lineStyle: { type: 'dashed', color: '#f0f0f0' } },
    },
    series: [
      {
        type: 'bar',
        name: '英语',
        data: enWeeklyData.map(v => ({
          value: v,
          itemStyle: { color: '#4F46E5', borderRadius: [4, 4, 0, 0] },
        })),
        barWidth: '30%',
        barGap: '20%',
        animationDuration: 800,
        animationEasing: 'cubicOut',
      },
      {
        type: 'bar',
        name: '文学',
        data: zhWeeklyData.map(v => ({
          value: v,
          itemStyle: { color: '#7C3AED', borderRadius: [4, 4, 0, 0] },
        })),
        barWidth: '30%',
        barGap: '20%',
        animationDuration: 800,
        animationEasing: 'cubicOut',
      },
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderWidth: 0,
      borderRadius: 8,
      shadowBlur: 10,
      shadowColor: 'rgba(0,0,0,0.1)',
    },
  });
});

// ── Notes ──
interface SgNote {
  type: 'text' | 'pdf';
  text: string;
  date: string;
  icon: string;
  pdfName?: string;
  pdfSize?: number;
  pdfData?: string; // base64 encoded PDF content
}

const notes = ref<SgNote[]>(loadNotes());
const newNoteText = ref('');
const pdfInputRef = ref<HTMLInputElement | null>(null);
const pdfImporting = ref(false);

function loadNotes(): SgNote[] {
  try {
    const raw = localStorage.getItem('sg-notes');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveNotes() {
  try {
    localStorage.setItem('sg-notes', JSON.stringify(notes.value));
  } catch { /* ignore */ }
}

const NOTE_ICONS = ['📝', '💡', '⭐', '📌'];

function addNote() {
  const text = newNoteText.value.trim();
  if (!text) return;
  notes.value.unshift({
    type: 'text',
    text,
    date: new Date().toLocaleDateString('zh-CN'),
    icon: NOTE_ICONS[notes.value.length % NOTE_ICONS.length],
  });
  newNoteText.value = '';
  saveNotes();
}

function removeNote(idx: number) {
  notes.value.splice(idx, 1);
  saveNotes();
}

function triggerPdfInput() {
  pdfInputRef.value?.click();
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function handlePdfImport(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  // Warn if file is too large (> 10MB)
  if (file.size > 10 * 1024 * 1024) {
    message.warning('PDF 文件过大（超过 10MB），建议压缩后导入');
    return;
  }

  pdfImporting.value = true;
  const reader = new FileReader();

  reader.onload = () => {
    const base64 = reader.result as string;
    notes.value.unshift({
      type: 'pdf',
      text: file.name,
      date: new Date().toLocaleDateString('zh-CN'),
      icon: '📄',
      pdfName: file.name,
      pdfSize: file.size,
      pdfData: base64,
    });
    saveNotes();
    pdfImporting.value = false;
    message.success(`已导入 PDF：${file.name}`);
    // Reset input so same file can be re-imported
    input.value = '';
  };

  reader.onerror = () => {
    pdfImporting.value = false;
    message.error('PDF 导入失败，请重试');
  };

  reader.readAsDataURL(file);
}

function openPdfNote(note: SgNote) {
  if (!note.pdfData) return;
  // Convert base64 data URL to Blob URL (browser-friendly for PDF viewing)
  try {
    const parts = note.pdfData.split(',');
    const meta = parts[0]?.match(/:(.*?);/);
    const mimeType = meta?.[1] || 'application/pdf';
    const byteStr = atob(parts[1] ?? '');
    const ab = new ArrayBuffer(byteStr.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteStr.length; i++) {
      ia[i] = byteStr.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl);
    // Release blob URL after 1 min to free memory
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch {
    message.error('无法打开 PDF 文件');
  }
}
</script>

<style scoped>
/* Keep styles minimal — most is handled by Tailwind */
</style>
