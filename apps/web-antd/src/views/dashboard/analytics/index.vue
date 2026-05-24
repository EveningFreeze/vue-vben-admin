<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { TabOption } from '@vben/types';

import { ref } from 'vue';

import {
  AnalysisChartCard,
  AnalysisChartsTabs,
  AnalysisOverview,
} from '@vben/common-ui';
import {
  SvgBellIcon,
  SvgCakeIcon,
  SvgCardIcon,
  SvgDownloadIcon,
} from '@vben/icons';

import AnalyticsTrends from './analytics-trends.vue';
import AnalyticsVisitsData from './analytics-visits-data.vue';
import AnalyticsVisitsSales from './analytics-visits-sales.vue';
import AnalyticsVisitsSource from './analytics-visits-source.vue';
import AnalyticsVisits from './analytics-visits.vue';

// ============ 英语学习模块 ============
const enOverview: AnalysisOverviewItem[] = [
  { icon: SvgCardIcon, title: '掌握词汇', totalTitle: '目标词汇', totalValue: 6000, value: 3452 },
  { icon: SvgCakeIcon, title: '批改作文', totalTitle: '累计作文量', totalValue: 200, value: 48 },
  { icon: SvgDownloadIcon, title: '听力训练(min)', totalTitle: '月度目标', totalValue: 1800, value: 735 },
  { icon: SvgBellIcon, title: '答题正确率', totalTitle: '满分', totalValue: 100, value: 87 },
];

const enChartTabs: TabOption[] = [
  { label: '学习活跃度', value: 'en-trends' },
  { label: '月度提分趋势', value: 'en-visits' },
  { label: '每日学习时段', value: 'en-daily' },
];

const enDailyHours = [
  { time: '6:00', vocab: 0, essay: 0, listen: 1, grammar: 0 },
  { time: '8:00', vocab: 5, essay: 1, listen: 3, grammar: 2 },
  { time: '10:00', vocab: 8, essay: 3, listen: 2, grammar: 5 },
  { time: '12:00', vocab: 3, essay: 1, listen: 4, grammar: 2 },
  { time: '14:00', vocab: 6, essay: 4, listen: 1, grammar: 3 },
  { time: '16:00', vocab: 10, essay: 6, listen: 3, grammar: 5 },
  { time: '18:00', vocab: 4, essay: 2, listen: 5, grammar: 1 },
  { time: '20:00', vocab: 12, essay: 5, listen: 4, grammar: 3 },
  { time: '22:00', vocab: 7, essay: 3, listen: 2, grammar: 1 },
];

const enActivities = [
  { icon: '✍️', text: '提交英语作文《AI in Education》', time: '10分钟前', score: 88, color: 'text-blue-500' },
  { icon: '🎧', text: '完成 BBC 新闻听力训练 Unit 3', time: '25分钟前', score: 75, color: 'text-blue-500' },
  { icon: '📚', text: '完成词汇闯关第 12 关 (IELTS)', time: '1小时前', score: 92, color: 'text-blue-500' },
  { icon: '🎯', text: '完成非谓语动词专项练习', time: '2小时前', score: 90, color: 'text-blue-500' },
  { icon: '📖', text: '阅读《Pride and Prejudice》Ch.3', time: '昨天', score: null, color: 'text-blue-400' },
  { icon: '💡', text: '收藏 3 个高分句式模板', time: '昨天', score: null, color: 'text-blue-400' },
];

// ============ 文学素养模块 ============
const zhOverview: AnalysisOverviewItem[] = [
  { icon: SvgCakeIcon, title: '学术写作', totalTitle: '累计批改', totalValue: 100, value: 23 },
  { icon: SvgCardIcon, title: '经典诵读', totalTitle: '掌握篇目', totalValue: 300, value: 156 },
  { icon: SvgDownloadIcon, title: '古文阅读(篇)', totalTitle: '学期目标', totalValue: 60, value: 42 },
  { icon: SvgBellIcon, title: '文化知识点', totalTitle: '总题库', totalValue: 500, value: 218 },
];

const zhChartTabs: TabOption[] = [
  { label: '学习活跃度', value: 'zh-trends' },
  { label: '能力成长曲线', value: 'zh-growth' },
  { label: '各模块进度', value: 'zh-modules' },
];

const zhModuleProgress = [
  { name: '诗词鉴赏', progress: 72, icon: '📜', color: 'bg-purple-500' },
  { name: '经典阅读', progress: 58, icon: '📖', color: 'bg-indigo-500' },
  { name: '学术写作', progress: 45, icon: '✍️', color: 'bg-rose-500' },
  { name: '文字训诂', progress: 35, icon: '🔍', color: 'bg-amber-500' },
  { name: '文化常识', progress: 66, icon: '🏛️', color: 'bg-emerald-500' },
  { name: '语法修辞', progress: 51, icon: '📝', color: 'bg-cyan-500' },
];

const zhActivities = [
  { icon: '📝', text: '提交学术写作《论唐宋诗风演变》', time: '2小时前', score: 85, color: 'text-purple-500' },
  { icon: '📜', text: '完成《诗经·关雎》背诵与赏析', time: '3小时前', score: 90, color: 'text-purple-500' },
  { icon: '📖', text: '阅读《论语·学而篇》并完成注解', time: '昨天', score: 88, color: 'text-purple-500' },
  { icon: '🔍', text: '完成文言虚词"之"字用法练习', time: '昨天', score: 72, color: 'text-purple-500' },
  { icon: '🏛️', text: '学习"科举制度"文化专题', time: '2天前', score: null, color: 'text-purple-400' },
  { icon: '✍️', text: '完成律诗格律分析练习', time: '2天前', score: 80, color: 'text-purple-500' },
];

// ============ Shared state ============
const activeTab = ref<'en' | 'zh'>('en');

const topLearners = [
  { rank: 1, name: 'Emma Watson', xp: 12800, module: '英语', trend: 'up' },
  { rank: 2, name: '李华', xp: 11200, module: '英语', trend: 'up' },
  { rank: 3, name: 'Chris', xp: 10500, module: '文学', trend: 'down' },
  { rank: 4, name: 'Sakura', xp: 9800, module: '英语', trend: 'up' },
  { rank: 5, name: 'Alex Chen', xp: 9200, module: '文学', trend: 'stable' },
];
</script>

<template>
  <div class="p-5 space-y-5">
    <!-- ========== Module Switcher ========== -->
    <div class="flex gap-2 p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl w-fit">
      <button
        :class="[
          'px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2',
          activeTab === 'en'
            ? 'bg-white dark:bg-zinc-700 shadow-md text-blue-600 dark:text-blue-400'
            : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300',
        ]"
        @click="activeTab = 'en'"
      >
        <span>🇬🇧</span> 英语学习分析
      </button>
      <button
        :class="[
          'px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2',
          activeTab === 'zh'
            ? 'bg-white dark:bg-zinc-700 shadow-md text-purple-600 dark:text-purple-400'
            : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300',
        ]"
        @click="activeTab = 'zh'"
      >
        <span>📜</span> 文学素养分析
      </button>
    </div>

    <!-- ===================================================== -->
    <!-- ENGLISH LEARNING TAB                                   -->
    <!-- ===================================================== -->
    <div v-if="activeTab === 'en'" class="space-y-5">
      <AnalysisOverview :items="enOverview" />

      <AnalysisChartsTabs :tabs="enChartTabs">
        <template #en-trends>
          <AnalyticsTrends />
        </template>
        <template #en-visits>
          <AnalyticsVisits />
        </template>
        <template #en-daily>
          <div class="p-4">
            <div class="grid grid-cols-9 gap-2">
              <div
                v-for="item in enDailyHours"
                :key="item.time"
                class="text-center p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/50"
              >
                <div class="text-[10px] text-gray-500 mb-1.5 font-bold">{{ item.time }}</div>
                <div class="space-y-1">
                  <div class="h-1 rounded-full bg-blue-200 dark:bg-blue-800/40" :style="{ width: (item.vocab / 12 * 100) + '%' }" />
                  <div class="h-1 rounded-full bg-purple-200 dark:bg-purple-800/40" :style="{ width: (item.essay / 6 * 100) + '%' }" />
                  <div class="h-1 rounded-full bg-amber-200 dark:bg-amber-800/40" :style="{ width: (item.listen / 5 * 100) + '%' }" />
                  <div class="h-1 rounded-full bg-emerald-200 dark:bg-emerald-800/40" :style="{ width: (item.grammar / 5 * 100) + '%' }" />
                </div>
                <div class="text-[9px] text-gray-400 mt-1">{{ item.vocab + item.essay + item.listen + item.grammar }}次</div>
              </div>
            </div>
            <div class="flex items-center gap-3 text-[10px] text-gray-400 mt-3 justify-center">
              <span class="flex items-center gap-1"><span class="w-3 h-1 rounded-full bg-blue-400 inline-block" /> 词汇</span>
              <span class="flex items-center gap-1"><span class="w-3 h-1 rounded-full bg-purple-400 inline-block" /> 作文</span>
              <span class="flex items-center gap-1"><span class="w-3 h-1 rounded-full bg-amber-400 inline-block" /> 听力</span>
              <span class="flex items-center gap-1"><span class="w-3 h-1 rounded-full bg-emerald-400 inline-block" /> 语法</span>
            </div>
          </div>
        </template>
      </AnalysisChartsTabs>

      <!-- English Charts Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnalysisChartCard title="英语核心能力雷达">
          <AnalyticsVisitsData />
        </AnalysisChartCard>
        <AnalysisChartCard title="学习时长分布">
          <AnalyticsVisitsSource />
        </AnalysisChartCard>
        <AnalysisChartCard title="错题专项分布">
          <AnalyticsVisitsSales />
        </AnalysisChartCard>
      </div>

      <!-- English Activity Feed -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-5 shadow-sm">
          <h3 class="text-sm font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
            <span>📡</span> 英语学习动态
          </h3>
          <div class="space-y-2 max-h-72 overflow-y-auto">
            <div
              v-for="(a, idx) in enActivities"
              :key="idx"
              class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-colors"
            >
              <span class="text-lg flex-shrink-0">{{ a.icon }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-gray-700 dark:text-zinc-300 truncate">{{ a.text }}</p>
                <span class="text-[10px] text-gray-400">{{ a.time }}</span>
              </div>
              <span v-if="a.score" :class="a.color" class="text-sm font-black flex-shrink-0">{{ a.score }}分</span>
              <span v-else class="text-xs text-gray-400 flex-shrink-0">--</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-5 shadow-sm">
          <h3 class="text-sm font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
            <span>🏅</span> 英语学习速览
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 bg-blue-50 dark:bg-blue-500/5 rounded-xl text-center">
              <div class="text-2xl">📚</div>
              <div class="text-xl font-black text-blue-600 dark:text-blue-400">3,452</div>
              <div class="text-[10px] text-gray-500">已掌握词汇</div>
            </div>
            <div class="p-3 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl text-center">
              <div class="text-2xl">🎯</div>
              <div class="text-xl font-black text-emerald-600 dark:text-emerald-400">87%</div>
              <div class="text-[10px] text-gray-500">答题正确率</div>
            </div>
            <div class="p-3 bg-amber-50 dark:bg-amber-500/5 rounded-xl text-center">
              <div class="text-2xl">🎧</div>
              <div class="text-xl font-black text-amber-500">735min</div>
              <div class="text-[10px] text-gray-500">本月听力时长</div>
            </div>
            <div class="p-3 bg-purple-50 dark:bg-purple-500/5 rounded-xl text-center">
              <div class="text-2xl">✍️</div>
              <div class="text-xl font-black text-purple-600 dark:text-purple-400">48篇</div>
              <div class="text-[10px] text-gray-500">累计批改作文</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- CHINESE LITERARY TAB                                   -->
    <!-- ===================================================== -->
    <div v-if="activeTab === 'zh'" class="space-y-5">
      <AnalysisOverview :items="zhOverview" />

      <AnalysisChartsTabs :tabs="zhChartTabs">
        <template #zh-trends>
          <AnalyticsTrends />
        </template>
        <template #zh-growth>
          <AnalyticsVisits />
        </template>
        <template #zh-modules>
          <div class="p-4 space-y-3">
            <div v-for="m in zhModuleProgress" :key="m.name" class="flex items-center gap-3">
              <span class="text-lg w-8 text-center flex-shrink-0">{{ m.icon }}</span>
              <span class="text-xs text-gray-600 dark:text-zinc-400 w-16 flex-shrink-0 font-bold">{{ m.name }}</span>
              <div class="flex-1 h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div :class="[m.color, 'h-full rounded-full transition-all duration-700']" :style="{ width: m.progress + '%' }" />
              </div>
              <span class="text-xs font-black text-gray-500 dark:text-zinc-400 w-10 text-right flex-shrink-0">{{ m.progress }}%</span>
            </div>
          </div>
        </template>
      </AnalysisChartsTabs>

      <!-- Chinese Charts Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnalysisChartCard title="语文素养雷达">
          <AnalyticsVisitsData />
        </AnalysisChartCard>
        <AnalysisChartCard title="各模块学习占比">
          <AnalyticsVisitsSource />
        </AnalysisChartCard>
        <AnalysisChartCard title="薄弱知识点分布">
          <AnalyticsVisitsSales />
        </AnalysisChartCard>
      </div>

      <!-- Chinese Activity Feed -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-5 shadow-sm">
          <h3 class="text-sm font-bold text-purple-600 dark:text-purple-400 mb-4 flex items-center gap-2">
            <span>📡</span> 文学学习动态
          </h3>
          <div class="space-y-2 max-h-72 overflow-y-auto">
            <div
              v-for="(a, idx) in zhActivities"
              :key="idx"
              class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-purple-50/50 dark:hover:bg-purple-500/5 transition-colors"
            >
              <span class="text-lg flex-shrink-0">{{ a.icon }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-xs text-gray-700 dark:text-zinc-300 truncate">{{ a.text }}</p>
                <span class="text-[10px] text-gray-400">{{ a.time }}</span>
              </div>
              <span v-if="a.score" :class="a.color" class="text-sm font-black flex-shrink-0">{{ a.score }}分</span>
              <span v-else class="text-xs text-gray-400 flex-shrink-0">--</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-5 shadow-sm">
          <h3 class="text-sm font-bold text-purple-600 dark:text-purple-400 mb-4 flex items-center gap-2">
            <span>🏅</span> 文学素养速览
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 bg-purple-50 dark:bg-purple-500/5 rounded-xl text-center">
              <div class="text-2xl">📜</div>
              <div class="text-xl font-black text-purple-600 dark:text-purple-400">156</div>
              <div class="text-[10px] text-gray-500">经典篇目掌握</div>
            </div>
            <div class="p-3 bg-rose-50 dark:bg-rose-500/5 rounded-xl text-center">
              <div class="text-2xl">✍️</div>
              <div class="text-xl font-black text-rose-600 dark:text-rose-400">23篇</div>
              <div class="text-[10px] text-gray-500">学术写作批改</div>
            </div>
            <div class="p-3 bg-indigo-50 dark:bg-indigo-500/5 rounded-xl text-center">
              <div class="text-2xl">📖</div>
              <div class="text-xl font-black text-indigo-600 dark:text-indigo-400">42篇</div>
              <div class="text-[10px] text-gray-500">古文阅读完成</div>
            </div>
            <div class="p-3 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl text-center">
              <div class="text-2xl">🏛️</div>
              <div class="text-xl font-black text-emerald-600 dark:text-emerald-400">218</div>
              <div class="text-[10px] text-gray-500">文化常识掌握</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== Shared: Leaderboard ========== -->
    <div class="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-5 shadow-sm">
      <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
        <span>🏆</span> 学霸排行榜
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
        <div
          v-for="learner in topLearners"
          :key="learner.rank"
          class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
        >
          <span
            :class="[
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0',
              learner.rank === 1 ? 'bg-yellow-400 text-white' :
              learner.rank === 2 ? 'bg-gray-300 text-white' :
              learner.rank === 3 ? 'bg-amber-600 text-white' :
              'bg-gray-100 dark:bg-zinc-700 text-gray-500',
            ]"
          >{{ learner.rank }}</span>
          <div class="flex-1 min-w-0">
            <div class="text-xs font-bold text-gray-700 dark:text-zinc-300">{{ learner.name }}</div>
            <div class="text-[10px] text-gray-400">{{ learner.xp.toLocaleString() }} XP · {{ learner.module }}</div>
          </div>
          <span class="text-xs">{{ learner.trend === 'up' ? '📈' : learner.trend === 'down' ? '📉' : '➡️' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
