<template>
  <EnglishPageLayout show-blob-2 show-blob-3>
    <div class="max-w-7xl mx-auto relative z-10 space-y-6">
      <!-- Hero Banner -->
      <div class="relative overflow-hidden bg-gradient-to-r from-en-600 to-en-cyan-500 rounded-3xl p-8 text-white shadow-2xl shadow-en-glow">
        <div class="relative z-10">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 class="text-2xl font-black mb-2 tracking-tight flex items-center gap-2">
                📅 2026 英语备考冲刺计划
              </h1>
              <div class="flex items-center gap-2">
                <p class="text-en-100 text-sm font-medium">距离目标考试还有</p>
                <span class="text-yellow-300 font-black text-3xl mx-1 tabular-nums">{{ countdownDays }}</span>
                <span class="text-en-100 text-sm font-medium">天</span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <DailyCheckIn />
            </div>
          </div>
          <div class="mt-4 max-w-xl">
            <XpBar />
          </div>
        </div>
        <div class="absolute -bottom-10 -right-10 text-[180px] opacity-10 select-none">🎓</div>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div class="bg-white dark:bg-[#18181b] rounded-xl border border-gray-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-en-50 dark:bg-en-500/10 flex items-center justify-center text-lg">⭐</div>
            <div>
              <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">当前等级</div>
              <div class="text-lg font-black text-gray-900 dark:text-white tabular-nums">Lv.{{ level }}</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-[#18181b] rounded-xl border border-gray-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-lg">🔥</div>
            <div>
              <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">连续打卡</div>
              <div class="text-lg font-black text-gray-900 dark:text-white tabular-nums">{{ streak }} <span class="text-sm font-medium text-gray-400">天</span></div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-[#18181b] rounded-xl border border-gray-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-en-50 dark:bg-en-500/10 flex items-center justify-center text-lg">📖</div>
            <div>
              <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">本周学习</div>
              <div class="text-lg font-black text-gray-900 dark:text-white tabular-nums">{{ weeklyStudyMinutes }} <span class="text-sm font-medium text-gray-400">min</span></div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-[#18181b] rounded-xl border border-gray-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-lg">✅</div>
            <div>
              <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">完成任务</div>
              <div class="text-lg font-black text-gray-900 dark:text-white tabular-nums">{{ totalDone }}/{{ totalTasks }}</div>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-[#18181b] rounded-xl border border-gray-200 dark:border-zinc-800 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-lg">🏆</div>
            <div>
              <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">累计 XP</div>
              <div class="text-lg font-black text-gray-900 dark:text-white tabular-nums">{{ xpDisplay }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Phase Timeline -->
          <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-base font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                <span class="en-accent-bar" />
                备考阶段规划
              </h2>
              <span class="text-[10px] text-gray-400 font-mono">{{ overallProgress }}% 完成</span>
            </div>

            <div class="space-y-6 relative before:absolute before:left-[21px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-100 dark:before:bg-zinc-800">
              <div v-for="(phase, index) in phases" :key="phase.id" class="relative pl-12">
                <!-- Step number -->
                <div
                  :class="[
                    'absolute left-0 top-1 w-11 h-11 rounded-xl flex items-center justify-center text-white z-10 transition-all',
                    phase.status === 'completed' ? 'bg-en-500 shadow-lg shadow-en-glow' :
                    phase.status === 'in-progress' ? 'bg-en-500 ring-4 ring-en-500/20 shadow-lg shadow-en-glow' :
                    'bg-slate-300 dark:bg-zinc-700',
                  ]"
                >
                  <span class="text-sm font-black">{{ index + 1 }}</span>
                </div>

                <!-- Phase card -->
                <div
                  :class="[
                    'p-5 rounded-2xl border transition-all hover:shadow-md',
                    phase.status === 'in-progress'
                      ? 'border-en-100 dark:border-en-500/30 bg-en-50/30 dark:bg-en-500/5'
                      : phase.status === 'completed'
                        ? 'border-en-100 dark:border-en-500/20 bg-en-50/20 dark:bg-en-500/5'
                        : 'border-gray-100 dark:border-zinc-800 bg-transparent',
                  ]"
                >
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-base font-black text-gray-900 dark:text-zinc-100">{{ phase.title }}</h3>
                    <span
                      :class="[
                        'text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider',
                        phase.status === 'completed'
                          ? 'text-en-600 bg-en-100 dark:bg-en-500/10 dark:text-en-400'
                          : phase.status === 'in-progress'
                            ? 'text-en-600 bg-en-100 dark:bg-en-500/10 dark:text-en-400'
                            : 'text-gray-400 bg-slate-100 dark:bg-zinc-800 dark:text-zinc-500',
                      ]"
                    >
                      {{ phase.status === 'completed' ? '✅ 已完成' : phase.status === 'in-progress' ? '🔥 进行中' : '📋 待开始' }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed font-medium mb-4">{{ phase.desc }}</p>

                  <!-- Phase progress -->
                  <div class="mb-3">
                    <div class="flex items-center justify-between text-xs mb-1">
                      <span class="text-gray-400 font-medium">完成进度</span>
                      <span class="font-mono text-gray-500">{{ phaseProgress(phase) }}%</span>
                    </div>
                    <div class="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-1000"
                        :class="phase.status === 'completed' ? 'bg-en-400' : phase.status === 'in-progress' ? 'bg-en-400' : 'bg-slate-300'"
                        :style="{ width: phaseProgress(phase) + '%' }"
                      />
                    </div>
                  </div>

                  <!-- Tasks with inline toggle -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div
                      v-for="task in tasksForPhase(phase.id)"
                      :key="task.id"
                      class="flex items-center gap-2 text-[11px] font-medium cursor-pointer group rounded-lg p-1.5 transition-all"
                      :class="task.done ? 'text-en-600 dark:text-en-400 bg-en-50/30 dark:bg-en-500/5' : 'text-gray-600 dark:text-zinc-300 hover:bg-en-50/30 dark:hover:bg-en-500/5'"
                      @click="togglePhaseTask(task)"
                    >
                      <span class="flex-shrink-0 transition-transform group-hover:scale-110">
                        {{ task.done ? '✅' : '⬜' }}
                      </span>
                      <span class="flex-1">{{ task.text }}</span>
                      <span class="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        +{{ task.xpReward }} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Weekly Study Duration Chart -->
          <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                <span class="en-accent-bar" />
                本周学习时长
              </h2>
              <div class="flex items-center gap-3 text-[10px] text-gray-400">
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-[#4F46E5]" /> 学习</span>
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-[#06B6D4]" /> 周末</span>
              </div>
            </div>
            <div class="h-64">
              <EchartsUI ref="weeklyChartRef" height="240px" />
            </div>
          </div>

          <!-- XP Trend Chart -->
          <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-en-500 rounded-full" />
                本周 XP 获取趋势
              </h2>
              <span class="text-[10px] text-en-600 dark:text-en-400 font-bold bg-en-50 dark:bg-en-cyan-500/10 px-2 py-0.5 rounded-full">
                本周 +{{ weeklyXpTotal }} XP
              </span>
            </div>
            <div class="h-52">
              <EchartsUI ref="xpTrendRef" height="200px" />
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Pomodoro Timer -->
          <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-en-cyan-500 rounded-full" />
                🍅 专注计时
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
                    stroke="url(#focusGradient)"
                    stroke-width="6"
                    stroke-linecap="round"
                    :stroke-dasharray="circumference"
                    :stroke-dashoffset="focusOffset"
                    class="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#4F46E5" />
                      <stop offset="100%" stop-color="#06B6D4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-3xl font-black text-gray-900 dark:text-white tabular-nums">{{ focusDisplay }}</span>
                  <span class="text-[10px] text-gray-400 font-medium">{{ focusRunning ? '专注中...' : focusPaused ? '已暂停' : '准备就绪' }}</span>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <button
                  v-if="!focusRunning && !focusPaused"
                  class="w-12 h-12 rounded-full bg-gradient-to-r from-en-600 to-en-cyan-500 text-white flex items-center justify-center text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                  @click="startFocus"
                >▶</button>
                <button
                  v-if="focusRunning"
                  class="w-12 h-12 rounded-full bg-en-cyan-500 text-white flex items-center justify-center text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                  @click="pauseFocus"
                >⏸</button>
                <button
                  v-if="focusPaused"
                  class="w-12 h-12 rounded-full bg-en-500 text-white flex items-center justify-center text-lg shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                  @click="resumeFocus"
                >▶</button>
                <button
                  v-if="focusRunning || focusPaused"
                  class="w-12 h-12 rounded-full bg-slate-200 dark:bg-zinc-700 text-gray-400 flex items-center justify-center text-lg hover:bg-slate-300 dark:hover:bg-zinc-600 transition-all"
                  @click="resetFocus"
                >⏹</button>
              </div>

              <div v-if="focusComplete" class="mt-3 text-xs font-bold text-en-600 dark:text-en-400 animate-bounce">
                🎉 专注完成！+20 XP
              </div>
            </div>
          </div>

          <!-- Today's Tasks -->
          <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-en-cyan-500 rounded-full" />
                今日任务
              </h3>
              <span class="text-[10px] font-mono text-gray-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                {{ doneCount }}/{{ todayTasks.length }}
              </span>
            </div>

            <div class="space-y-2">
              <div
                v-for="task in todayTasks"
                :key="task.id"
                class="flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group"
                :class="task.done ? 'bg-en-50/50 dark:bg-en-500/5' : 'bg-slate-50 dark:bg-zinc-900/50 hover:bg-en-50/50 dark:hover:bg-en-500/5'"
                @click="toggleTask(task)"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    :class="[
                      'w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                      task.done ? 'bg-en-500 border-en-500 scale-110' : 'border-slate-300 dark:border-zinc-600 group-hover:border-en-400',
                    ]"
                  >
                    <span v-if="task.done" class="text-white text-[10px]">✓</span>
                  </div>
                  <span
                    :class="[
                      'text-xs font-bold transition-all',
                      task.done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-zinc-200',
                    ]"
                  >
                    {{ task.text }}
                  </span>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="px-1.5 py-0.5 rounded text-[9px] font-bold" :class="taskCategoryBadge(task.category)">{{ task.category }}</span>
                  <span class="text-[10px] font-mono text-gray-400">{{ task.duration }}</span>
                  <span v-if="!task.done" class="text-[10px] text-en-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">+{{ task.xpReward }} XP</span>
                </div>
              </div>
            </div>

            <!-- Add custom task -->
            <div class="mt-4 pt-4 border-t border-dashed dark:border-zinc-800">
              <div v-if="!showAddTask" class="text-center">
                <button class="text-xs text-en-500 hover:text-en-600 font-bold transition-colors" @click="showAddTask = true">
                  + 添加自定义任务
                </button>
              </div>
              <div v-else class="space-y-2">
                <div class="flex gap-2">
                  <input
                    v-model="newTaskText"
                    placeholder="输入任务内容..."
                    class="flex-1 p-2.5 text-xs border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 focus:ring-1 focus:ring-en-500 outline-none transition-all"
                    @keyup.enter="addTask"
                  />
                  <select
                    v-model="newTaskCategory"
                    class="p-2.5 text-xs border rounded-xl dark:bg-zinc-900 dark:border-zinc-700 focus:ring-1 focus:ring-en-500 outline-none transition-all text-gray-500"
                  >
                    <option value="vocab">词汇</option>
                    <option value="grammar">语法</option>
                    <option value="reading">阅读</option>
                    <option value="writing">写作</option>
                    <option value="listening">听力</option>
                  </select>
                </div>
                <div class="flex gap-2">
                  <button class="flex-1 py-2 bg-en-500 text-white text-xs rounded-xl font-bold hover:bg-en-600 transition-colors" @click="addTask">添加</button>
                  <button class="py-2 px-4 text-gray-400 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors" @click="showAddTask = false">取消</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Skill Radar Chart -->
          <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
                <span class="w-1.5 h-4 bg-en-500 rounded-full" />
                学习能力评估
              </h3>
              <button class="text-[10px] text-purple-500 font-bold hover:text-purple-700 transition-colors" @click="randomizeSkills">
                ↻ 模拟评估
              </button>
            </div>
            <div class="h-64">
              <EchartsUI ref="radarRef" height="240px" />
            </div>
          </div>

          <!-- AI Suggestions -->
          <div class="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] p-6 rounded-2xl text-white relative overflow-hidden shadow-xl border border-en-500/20">
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 bg-en-400 rounded-full animate-pulse" />
                  <h3 class="text-xs font-black uppercase tracking-widest">AI 智启建议</h3>
                </div>
                <button class="text-[10px] text-en-300 hover:text-white transition-colors font-bold" @click="refreshSuggestion">换一批 ↻</button>
              </div>
              <Transition name="suggestion" mode="out-in">
                <div :key="currentSuggestionIndex" class="space-y-2">
                  <span class="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-white/10 text-en-200">{{ suggestionCategory }}</span>
                  <p class="text-xs text-en-100 leading-relaxed font-medium">{{ currentSuggestion }}</p>
                </div>
              </Transition>
              <div class="mt-4 flex items-center gap-2 text-[10px] text-en-300/60">基于你的学习数据生成</div>
            </div>
            <div class="absolute top-0 right-0 w-32 h-32 bg-en-500/10 blur-3xl rounded-full" />
          </div>

          <!-- Quick Actions -->
          <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-en-cyan-500 rounded-full" />
              ⚡ 快捷操作
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="action in quickActions"
                :key="action.title"
                class="p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.03] active:scale-95 border"
                :class="action.borderClass"
                :style="{ background: action.bgGradient }"
                @click="navTo(action.url)"
              >
                <span class="text-2xl block mb-1">{{ action.icon }}</span>
                <div class="text-xs font-bold text-white">{{ action.title }}</div>
                <div class="text-[9px] text-white/60 mt-0.5">{{ action.desc }}</div>
              </div>
            </div>
          </div>

          <!-- Achievements -->
          <div class="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
            <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <span>🏆</span> 最新成就
            </h3>
            <div class="space-y-3">
              <AchievementCard v-for="ach in recentAch" :key="ach.id" :achievement="ach" />
              <div v-if="recentAch.length === 0" class="text-center py-4">
                <span class="text-3xl block mb-2">🌟</span>
                <p class="text-xs text-gray-400 font-medium">继续学习解锁成就</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </EnglishPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import type { EchartsUIType } from '@vben/plugins/echarts';
import { useGamification } from '../shared/use-gamification';
import type { StudyTask, StudyPhase } from '../shared/types';
import { DailyCheckIn, XpBar, AchievementCard } from '../components';

const router = useRouter();
const gamification = useGamification();
const level = computed(() => gamification.level.value);
const streak = computed(() => gamification.streakDays.value);
const xpDisplay = computed(() => {
  const v = gamification.xp.value;
  return v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);
});

// --- Countdown ---
const examDate = new Date('2026-06-13');
const countdownDays = computed(() => {
  const diff = examDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
});

// --- Phase definitions ---
const phases = ref<StudyPhase[]>([
  {
    id: 'phase-1', title: '基础巩固期 (Weeks 1-4)', weekStart: 1, weekEnd: 4,
    status: 'completed', color: 'emerald',
    desc: '聚焦核心 3500 词汇与基础语法框架，建立写作衡水体字形基础。',
    tasks: [
      { id: 'p1t1', text: '核心词汇两轮复习', duration: '2h', done: true, category: 'vocab', xpReward: 30 },
      { id: 'p1t2', text: '五大基本句型掌握', duration: '1.5h', done: true, category: 'grammar', xpReward: 25 },
      { id: 'p1t3', text: '衡水体字母单项训练', duration: '1h', done: true, category: 'writing', xpReward: 20 },
      { id: 'p1t4', text: '基础听力入门训练', duration: '1h', done: false, category: 'listening', xpReward: 20 },
    ],
  },
  {
    id: 'phase-2', title: '强化突破期 (Weeks 5-8)', weekStart: 5, weekEnd: 8,
    status: 'in-progress', color: 'indigo',
    desc: '专项突破听力长对话、阅读深度理解，以及作文的高级句式表达。',
    tasks: [
      { id: 'p2t1', text: '长难句拆解训练', duration: '2h', done: true, category: 'reading', xpReward: 30 },
      { id: 'p2t2', text: 'AI 作文批改提分', duration: '1.5h', done: false, category: 'writing', xpReward: 25 },
      { id: 'p2t3', text: '真题阅读分类解析', duration: '2h', done: false, category: 'reading', xpReward: 30 },
      { id: 'p2t4', text: '听力精听训练', duration: '1h', done: false, category: 'listening', xpReward: 25 },
    ],
  },
  {
    id: 'phase-3', title: '冲刺模拟期 (Weeks 9-12)', weekStart: 9, weekEnd: 12,
    status: 'upcoming', color: 'slate',
    desc: '全真模拟套卷练习，严格控制答题时间，进行错词本最后扫盲。',
    tasks: [
      { id: 'p3t1', text: '全真模拟套卷 10 套', duration: '3h', done: false, category: 'reading', xpReward: 50 },
      { id: 'p3t2', text: '考前错词本彻底清查', duration: '1h', done: false, category: 'vocab', xpReward: 20 },
      { id: 'p3t3', text: '考前心态管理', duration: '30min', done: false, category: 'grammar', xpReward: 10 },
    ],
  },
]);

// --- Phase tasks ---
function tasksForPhase(phaseId: string): StudyTask[] {
  return phases.value.find(p => p.id === phaseId)?.tasks || [];
}

function togglePhaseTask(task: StudyTask) {
  task.done = !task.done;
  if (task.done) gamification.addXp(task.xpReward);
}

function phaseProgress(phase: StudyPhase): number {
  if (!phase.tasks.length) return 0;
  const done = phase.tasks.filter(t => t.done).length;
  return Math.round((done / phase.tasks.length) * 100);
}

const overallProgress = computed(() => {
  const allTasks = phases.value.flatMap(p => p.tasks);
  if (!allTasks.length) return 0;
  return Math.round((allTasks.filter(t => t.done).length / allTasks.length) * 100);
});

const totalTasks = computed(() => phases.value.flatMap(p => p.tasks).length);
const totalDone = computed(() => phases.value.flatMap(p => p.tasks).filter(t => t.done).length);

// --- Today's tasks ---
const todayTasks = ref<StudyTask[]>(loadTodayTasks());
const showAddTask = ref(false);
const newTaskText = ref('');
const newTaskCategory = ref<StudyTask['category']>('vocab');

const doneCount = computed(() => todayTasks.value.filter(t => t.done).length);

function loadTodayTasks(): StudyTask[] {
  try {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`en-tasks-${today}`);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [
    { id: 'dt-1', text: '单词速记 (50词)', duration: '20min', done: false, category: 'vocab', xpReward: 15 },
    { id: 'dt-2', text: '衡水体临摹练习', duration: '15min', done: false, category: 'writing', xpReward: 10 },
    { id: 'dt-3', text: '阅读理解专项 (3篇)', duration: '40min', done: false, category: 'reading', xpReward: 25 },
    { id: 'dt-4', text: 'AI 作文练习与批改', duration: '30min', done: false, category: 'writing', xpReward: 20 },
  ];
}

function saveTodayTasks() {
  try {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`en-tasks-${today}`, JSON.stringify(todayTasks.value));
  } catch { /* ignore */ }
}

function toggleTask(task: StudyTask) {
  task.done = !task.done;
  if (task.done) gamification.addXp(task.xpReward);
  gamification.trackStudyMinutes(parseInt(task.duration) || 10);
  saveTodayTasks();
}

function addTask() {
  const text = newTaskText.value.trim();
  if (!text) return;
  todayTasks.value.push({
    id: `custom-${Date.now()}`,
    text,
    duration: '15min',
    done: false,
    category: newTaskCategory.value,
    xpReward: 10,
  });
  newTaskText.value = '';
  showAddTask.value = false;
  saveTodayTasks();
}

function taskCategoryBadge(cat: string): string {
  const map: Record<string, string> = {
    vocab: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
    grammar: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
    reading: 'bg-en-100 text-emerald-700 dark:bg-en-500/10 dark:text-en-400',
    writing: 'bg-zinc-200 text-zinc-700 dark:bg-en-cyan-500/10 dark:text-en-400',
    listening: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  };
  return map[cat] || 'bg-gray-100 text-gray-700';
}

// --- Weekly study minutes ---
const weeklyStudyMinutes = 400;
const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const weeklyData = [45, 30, 60, 0, 90, 120, 55];

// --- Pomodoro Timer ---
const FOCUS_MINUTES = 25;
const circumference = 2 * Math.PI * 50;

const focusSeconds = ref(FOCUS_MINUTES * 60);
const focusRunning = ref(false);
const focusPaused = ref(false);
const focusComplete = ref(false);
const focusCount = ref(loadFocusCount());
let focusTimer: ReturnType<typeof setInterval> | null = null;
const weeklyXpData = [25, 40, 60, 0, 85, 110, 50];
const weeklyXpTotal = computed(() => weeklyXpData.reduce((a, b) => a + b, 0));

const focusDisplay = computed(() => {
  const m = Math.floor(focusSeconds.value / 60);
  const s = focusSeconds.value % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

const focusOffset = computed(() => {
  const progress = focusSeconds.value / (FOCUS_MINUTES * 60);
  return circumference * (1 - progress);
});

function loadFocusCount(): number {
  try {
    const today = new Date().toISOString().split('T')[0];
    const raw = localStorage.getItem('en-focus-count');
    if (!raw) return 0;
    const data = JSON.parse(raw);
    return data.date === today ? data.count : 0;
  } catch { return 0; }
}

function saveFocusCount(count: number) {
  try {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('en-focus-count', JSON.stringify({ date: today, count }));
  } catch { /* ignore */ }
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
  focusSeconds.value = FOCUS_MINUTES * 60;
}

function completeFocus() {
  if (focusTimer) clearInterval(focusTimer);
  focusRunning.value = false;
  focusPaused.value = false;
  focusComplete.value = true;
  focusCount.value++;
  saveFocusCount(focusCount.value);
  gamification.addXp(20);
  gamification.trackStudyMinutes(FOCUS_MINUTES);

  setTimeout(() => {
    focusComplete.value = false;
    focusSeconds.value = FOCUS_MINUTES * 60;
  }, 3000);
}

onUnmounted(() => {
  if (focusTimer) clearInterval(focusTimer);
});

// --- Skill Radar ---
const radarRef = ref<EchartsUIType>();
const { renderEcharts: renderRadar } = useEcharts(radarRef);

const skillLabels = ['词汇量', '语法', '阅读', '写作', '听力'];
const skills = ref<number[]>(loadSkills());

function loadSkills(): number[] {
  try {
    const saved = localStorage.getItem('en-skill-levels');
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [65, 55, 70, 45, 50];
}

function saveSkills() {
  try {
    localStorage.setItem('en-skill-levels', JSON.stringify(skills.value));
  } catch { /* ignore */ }
}

function randomizeSkills() {
  skills.value = skills.value.map(s => Math.min(100, Math.max(10, s + Math.round((Math.random() - 0.5) * 20))));
  saveSkills();
  renderRadarChart();
}

function renderRadarChart() {
  renderRadar({
    radar: {
      indicator: skillLabels.map(name => ({ name, max: 100 })),
      radius: '60%',
      splitNumber: 4,
      axisName: { color: '#888', fontSize: 11, fontWeight: 'bold' },
      splitArea: {
        areaStyle: {
          color: ['rgba(79,70,229,0.02)', 'rgba(79,70,229,0.04)', 'rgba(79,70,229,0.06)', 'rgba(79,70,229,0.08)'],
        },
      },
      axisLine: { lineStyle: { color: 'rgba(79,70,229,0.2)' } },
      splitLine: { lineStyle: { color: 'rgba(79,70,229,0.15)' } },
    },
    series: [{
      type: 'radar',
      data: [{
        value: skills.value,
        areaStyle: { color: 'rgba(79,70,229,0.25)' },
        lineStyle: { color: '#4F46E5', width: 2 },
        itemStyle: { color: '#4F46E5' },
      }],
      symbol: 'circle',
      symbolSize: 6,
      animationDuration: 800,
      animationEasing: 'cubicOut',
    }],
    tooltip: {
      formatter: ((params: { value: number[] }) => {
        return skillLabels.map((label, i) => `${label}: ${params.value[i]}/100`).join('<br/>');
      }) as unknown as string,
    },
  });
}

// --- Weekly chart ---
const weeklyChartRef = ref<EchartsUIType>();
const { renderEcharts: renderWeekly } = useEcharts(weeklyChartRef);

function renderWeeklyChart() {
  renderWeekly({
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: weekDays,
      axisLabel: { fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitNumber: 4,
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } },
    },
    series: [{
      type: 'bar',
      data: weeklyData.map((v, i) => ({
        value: v,
        itemStyle: {
          color: i >= 5 ? '#06B6D4' : '#4F46E5',
          borderRadius: [6, 6, 0, 0],
        },
      })),
      barWidth: '60%',
      animationDuration: 800,
      animationEasing: 'cubicOut',
      label: {
        show: true,
        position: 'top',
        fontSize: 10,
        color: '#999',
        formatter: ((params: { value: number }) => params.value ? `${params.value}min` : '') as unknown as string,
      },
    }],
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>学习时长：{c} 分钟',
    },
  });
}

// --- XP Trend Chart ---
const xpTrendRef = ref<EchartsUIType>();
const { renderEcharts: renderXpTrend } = useEcharts(xpTrendRef);

function renderXpTrendChart() {
  renderXpTrend({
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: weekDays,
      axisLabel: { fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitNumber: 3,
      axisLabel: { fontSize: 9 },
      splitLine: { lineStyle: { type: 'dashed', color: '#e5e7eb' } },
    },
    series: [{
      type: 'line',
      data: weeklyXpData.map(v => ({ value: v })),
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { color: '#f59e0b', width: 3 },
      itemStyle: { color: '#f59e0b' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(245,158,11,0.3)' },
            { offset: 1, color: 'rgba(245,158,11,0.02)' },
          ],
        },
      },
      animationDuration: 800,
      animationEasing: 'cubicOut',
      label: {
        show: true,
        position: 'top',
        fontSize: 9,
        color: '#999',
        formatter: ((params: { value: number }) => params.value ? `${params.value}` : '') as unknown as string,
      },
    }],
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>获取 XP：{c}',
    },
  });
}

// --- AI Suggestions ---
interface Suggestion { text: string; category: string; }
const allSuggestions: Suggestion[] = [
  { text: '根据你在词汇能力测评中的表现，建议本周重点突破非谓语动词。在进行衡水体作文训练时，多使用 "Having said that" 等高级连接词。', category: '语法' },
  { text: '你的阅读理解正确率已达 75%，建议增加长难句专项训练，尤其是带有多个从句的复合句分析。', category: '阅读' },
  { text: '听力方面推荐每天精听 15 分钟 VOA 慢速英语，重点训练数字、日期和地名的快速反应能力。', category: '听力' },
  { text: '写作提分关键：尝试在每篇作文中使用至少 2 个高级从句和 1 个倒装句结构，可提升语法维度得分。', category: '写作' },
  { text: '词汇建议：根据遗忘曲线规律，建议在学新词后的第 1、3、7 天进行复习，记忆效果最佳。', category: '词汇' },
  { text: '完形填空提分技巧：先通读全文把握主旨，再逐空选择，注意上下文逻辑线索和固定搭配。', category: '综合' },
  { text: '衡水体书写要点：字母向右倾斜 5-10 度，大小均匀，连笔自然。每日临摹 15 分钟效果显著。', category: '写作' },
  { text: '听力精听三步法：第一遍理解大意，第二遍逐句听写，第三遍对照原文查漏补缺。坚持两周必有提升。', category: '听力' },
  { text: '阅读定位技巧：先读题干划关键词，再回原文定位。注意同义替换是出题的高频手法。', category: '阅读' },
  { text: '虚拟语气高频考点：混合虚拟(错综时间条件句)是近年考试难点，注意主从句时间不一致的情况。', category: '语法' },
  { text: '词根词缀记忆法：了解常见前缀后缀可大幅提升词汇量。如 -spect (看): inspect, respect, prospect。', category: '词汇' },
  { text: '口语提升建议：每天跟读模仿 10 分钟，注意连读和弱读。推荐使用 AI 语伴进行对话练习。', category: '综合' },
];

const currentSuggestionIndex = ref(0);
const currentSuggestion = computed(() => allSuggestions[currentSuggestionIndex.value]?.text ?? '');
const suggestionCategory = computed(() => allSuggestions[currentSuggestionIndex.value]?.category ?? '');

function refreshSuggestion() {
  let next: number;
  do {
    next = Math.floor(Math.random() * allSuggestions.length);
  } while (next === currentSuggestionIndex.value && allSuggestions.length > 1);
  currentSuggestionIndex.value = next;
}

// --- Quick Actions ---
const quickActions = [
  { icon: '✍️', title: '作文批改', desc: 'AI 智能评分批改', url: '/english-learning/essay', bgGradient: 'linear-gradient(135deg, #4F46E5, #8b5cf6)', borderClass: 'border-en-500/30' },
  { icon: '📝', title: '词汇闯关', desc: '每日词汇挑战', url: '/english-learning/quiz', bgGradient: 'linear-gradient(135deg, #10b981, #059669)', borderClass: 'border-en-500/30' },
  { icon: '🎧', title: '听力训练', desc: '精听 & 泛听练习', url: '/english-learning/listening', bgGradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderClass: 'border-blue-500/30' },
  { icon: '💬', title: 'AI 语伴', desc: '口语对话练习', url: '/english-learning/ai-partner', bgGradient: 'linear-gradient(135deg, #06B6D4, #db2777)', borderClass: 'border-pink-500/30' },
];

function navTo(url: string) {
  router.push(url).catch(() => {});
}

// --- Achievements ---
const recentAch = computed(() => gamification.getRecentUnlocks());

// --- Lifecycle ---
onMounted(() => {
  renderWeeklyChart();
  renderXpTrendChart();
  renderRadarChart();
});
</script>

<style scoped>
.suggestion-enter-active,
.suggestion-leave-active {
  transition: all 0.3s ease;
}
.suggestion-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.suggestion-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
