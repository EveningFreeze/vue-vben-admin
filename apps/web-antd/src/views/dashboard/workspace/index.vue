<script lang="ts" setup>
import type {
  WorkbenchProjectItem,
  WorkbenchQuickNavItem,
  WorkbenchTodoItem,
  WorkbenchTrendItem,
} from '@vben/common-ui';

import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import {
  AnalysisChartCard,
  WorkbenchHeader,
  WorkbenchProject,
  WorkbenchQuickNav,
  WorkbenchTodo,
  WorkbenchTrends,
} from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';
import { message } from 'ant-design-vue';

import AnalyticsVisitsSource from '../analytics/analytics-visits-source.vue';

const userStore = useUserStore();
const router = useRouter();

// ─── Daily Check-in / Word Review ───
const isReviewing = ref(false);
const wordIndex = ref(0);
const showAnswer = ref(false);

const reviewList = [
  { word: 'Algorithm', phonetic: 'ˈælɡərɪðəm', meaning: 'n. 算法', example: 'The algorithm optimizes the deployment of NAO robots.' },
  { word: 'Framework', phonetic: 'ˈfreɪmwɜːrk', meaning: 'n. 框架，结构', example: 'We are using the Odoo framework for lab management.' },
  { word: 'Synchronize', phonetic: 'ˈsɪŋkrənaɪz', meaning: 'v. 同步', example: 'The system helps synchronize dance movements across multiple robots.' },
  { word: 'Deploy', phonetic: 'dɪˈplɔɪ', meaning: 'v. 部署，配置', example: 'We will deploy the new model to production servers.' },
  { word: 'Acquisition', phonetic: 'ˌækwɪˈzɪʃən', meaning: 'n. 获取，习得', example: 'Language acquisition requires consistent practice.' },
];

const currentWord = computed(() => reviewList[wordIndex.value]);

const handleStartReview = () => {
  wordIndex.value = 0;
  showAnswer.value = false;
  isReviewing.value = true;
};

const nextWord = () => {
  if (wordIndex.value < reviewList.length - 1) {
    wordIndex.value++;
    showAnswer.value = false;
  } else {
    message.success('今日打卡回顾已完成！');
    isReviewing.value = false;
  }
};

// ─── Stats Cards Data ───
const todayStats = ref({
  wordsLearned: 32,
  wordsGoal: 50,
  essaysSubmitted: 2,
  essaysGoal: 3,
  listeningMinutes: 45,
  listeningGoal: 60,
  streakDays: 15,
  quizAccuracy: 87,
  totalXp: 4850,
  weeklyXp: 720,
});

const clockGreeting = computed(() => {
  const h = new Date().getHours();
  if (h < 6) return '夜深了';
  if (h < 9) return '早安';
  if (h < 12) return '上午好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  if (h < 22) return '晚上好';
  return '夜深了';
});

const todayDate = computed(() => {
  const d = new Date();
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${days[d.getDay()]}`;
});

// ─── Activity Heatmap Data ───
const heatmapWeeks = ref<{ day: number; intensity: number; label: string }[][]>([]);

function generateHeatmap() {
  const weeks: { day: number; intensity: number; label: string }[][] = [];
  const now = new Date();
  for (let w = 0; w < 20; w++) {
    const week: { day: number; intensity: number; label: string }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (140 - (w * 7 + d)));
      const dayOfWeek = date.getDay();
      const isFuture = date > now;
      week.push({
        day: dayOfWeek,
        intensity: isFuture ? -1 : Math.random() > 0.3 ? Math.floor(Math.random() * 4) : 0,
        label: `${date.getMonth() + 1}/${date.getDate()}`,
      });
    }
    weeks.push(week);
  }
  heatmapWeeks.value = weeks;
}

onMounted(() => generateHeatmap());

// ─── Recent Essays ───
const recentEssays = ref([
  { id: 'e1', title: 'The Impact of AI on Education', date: '2026-05-22', score: 88, words: 245, status: '已批改' },
  { id: 'e2', title: 'Should College Entrance Exams Be Reformed?', date: '2026-05-21', score: 76, words: 312, status: '已批改' },
  { id: 'e3', title: '环境保护与经济发展', date: '2026-05-20', score: 82, words: 1200, status: '已批改', isChinese: true },
  { id: 'e4', title: 'My View on Online Learning', date: '2026-05-19', score: 91, words: 198, status: '已批改' },
]);

// ─── Projects ───
const projectItems: WorkbenchProjectItem[] = [
  {
    color: '#3b82f6',
    content: '基于 Gemini AI 的全维度英语作文批改，实时语法纠错、词汇润色与结构优化。',
    date: 'AI 驱动',
    group: '核心引擎',
    icon: 'ant-design:edit-outlined',
    title: 'AI 作文批改',
    url: '/english/essay',
  },
  {
    color: '#8b5cf6',
    content: '中国风学术写作评估，涵盖论点深度、逻辑结构、学术规范五维评分。',
    date: 'AI 评估',
    group: '学术写作',
    icon: 'ant-design:file-text-outlined',
    title: '学术写作评估',
    url: '/chinese-learning/writing',
  },
  {
    color: '#10b981',
    content: '个性化词汇测试，涵盖四六级、雅思、托福核心词库，自适应难度。',
    date: '已更新',
    group: '能力评估',
    icon: 'ant-design:book-outlined',
    title: '词汇闯关',
    url: '/english/quiz',
  },
  {
    color: '#f59e0b',
    content: '12 周 AI 生成备考冲刺计划，动态调整学习路径。',
    date: '待查看',
    group: '备考指南',
    icon: 'ant-design:calendar-outlined',
    title: '智能备考规划',
    url: '/english/report',
  },
  {
    color: '#ef4444',
    content: 'AI 驱动的错题追踪系统，基于遗忘曲线智能推送复习。',
    date: '活跃',
    group: '复习工具',
    icon: 'ant-design:file-exclamation-outlined',
    title: '智能错词本',
    url: '/english/report',
  },
  {
    color: '#06b6d4',
    content: '全球英语学习者交流社区，分享高分范文与学习心得。',
    date: '2k+ 在线',
    group: '互动社区',
    icon: 'ant-design:message-outlined',
    title: '英语论坛',
    url: '#',
  },
  {
    color: '#ec4899',
    content: 'AI 实时检测衡水体书写规范度，提供笔画级纠偏建议。',
    date: 'V2.0',
    group: '专项突破',
    icon: 'ant-design:form-outlined',
    title: '衡水体纠偏',
    url: '/english/essay',
  },
  {
    color: '#6366f1',
    content: '基于真实场景的 AI 英语对话练习，实时语法纠正与发音反馈。',
    date: '热门',
    group: '口语练习',
    icon: 'ant-design:customer-service-outlined',
    title: 'AI 语伴',
    url: '#',
  },
  {
    color: '#14b8a6',
    content: 'VOA/BBC 精听 + 泛听训练，覆盖新闻、演讲、学术场景。',
    date: 'NEW',
    group: '听力训练',
    icon: 'ant-design:audio-outlined',
    title: '听力训练',
    url: '/english-learning/listening',
  },
];

const quickNavItems: WorkbenchQuickNavItem[] = [
  { color: '#3b82f6', icon: 'ant-design:dashboard-outlined', title: '学情大屏', url: '/dashboard/analysis' },
  { color: '#ef4444', icon: 'ant-design:read-outlined', title: '今日阅读', url: '/english/essay' },
  { color: '#f59e0b', icon: 'ant-design:audio-outlined', title: '听力训练', url: '/english-learning/listening' },
  { color: '#10b981', icon: 'ant-design:customer-service-outlined', title: 'AI 语伴', url: '#' },
  { color: '#8b5cf6', icon: 'ant-design:star-outlined', title: '高频考点', url: '#' },
  { color: '#06b6d4', icon: 'ant-design:bar-chart-outlined', title: '能力分布', url: '/english/report' },
  { color: '#ec4899', icon: 'ant-design:message-outlined', title: '学习论坛', url: '#' },
  { color: '#6366f1', icon: 'ant-design:trophy-outlined', title: '排行榜', url: '#' },
];

const todoItems = ref<WorkbenchTodoItem[]>([
  { completed: false, content: '完成 2026 年 6 月大学英语六级模拟套卷的听力部分。', date: '2026-05-22 10:00', title: '模拟套卷训练' },
  { completed: true, content: '通过 AI 批改中心提交一篇关于"人工智能"的主题作文。', date: '2026-05-21 15:00', title: '范文练习提交' },
  { completed: false, content: '复习错词本中标记为"高频遗忘"的 50 个词汇。', date: '2026-05-22 20:00', title: '错词深度复习' },
  { completed: false, content: '整理衡水体书写中的常见连笔错误，对比 AI 评分建议进行修正。', date: '2026-05-23 11:00', title: '书法规范纠正' },
  { completed: false, content: '完成学术写作评估中的文献综述部分，提交至 AI 评估系统。', date: '2026-05-24 09:00', title: '学术写作评估' },
]);

const trendItems: WorkbenchTrendItem[] = [
  { avatar: 'svg:avatar-1', content: '在 <a>精选范文</a> 发布了 <a>《如何在高难度作文中保持句式多样性》</a>', date: '刚刚', title: 'Teacher Wang' },
  { avatar: 'svg:avatar-2', content: '关注了你的 <a>备考日志</a> 并点赞 ', date: '2小时前', title: '李华' },
  { avatar: 'svg:avatar-3', content: '在 <a>词汇排行榜</a> 中超越了 98% 的用户 ', date: '1天前', title: '克里斯' },
  { avatar: 'svg:avatar-4', content: '发布了新文章 <a>衡水体书写的 3 个核心技巧</a> ', date: '2天前', title: '智启英语 AI' },
  { avatar: 'svg:avatar-1', content: '回复了 <a>杰克</a> 的问题 <a>独立主格结构如何应用？</a>', date: '3天前', title: '英语专业组' },
  { avatar: 'svg:avatar-2', content: '赞了你的 <a>《学术写作评估报告》</a>', date: '3天前', title: 'Emma' },
];

function navTo(nav: WorkbenchProjectItem | WorkbenchQuickNavItem) {
  if (nav.url?.startsWith('http')) {
    openWindow(nav.url);
    return;
  }
  if (nav.url?.startsWith('/')) {
    router.push(nav.url).catch((err) => console.error(err));
  } else {
    message.info('模块即将上线');
  }
}

function heatmapColor(intensity: number): string {
  if (intensity < 0) return 'transparent';
  if (intensity === 0) return 'bg-zinc-100 dark:bg-zinc-800';
  if (intensity === 1) return 'bg-blue-200 dark:bg-blue-900/40';
  if (intensity === 2) return 'bg-blue-400 dark:bg-blue-700/60';
  if (intensity === 3) return 'bg-blue-600 dark:bg-blue-500/80';
  return 'bg-blue-700 dark:bg-blue-400';
}
</script>

<template>
  <div class="p-5">
    <WorkbenchHeader :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar">
      <template #title>
        {{ clockGreeting }}, {{ userStore.userInfo?.realName || '同学' }} 👋 今天也是提升学习的好机会！
      </template>
      <template #description>
        <div class="flex items-center gap-4 flex-wrap">
          <span class="text-sm opacity-80">{{ todayDate }} · 已连续打卡 {{ todayStats.streakDays }} 天 🔥</span>
          <button
            @click="handleStartReview"
            class="px-4 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95 font-bold"
          >
            📝 开始今日回顾
          </button>
        </div>
      </template>
    </WorkbenchHeader>

    <!-- ─── Stats Overview Row ─── -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-5">
      <div class="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-3 text-center shadow-sm hover:shadow-md transition-all col-span-2">
        <div class="text-2xl mb-1">📚</div>
        <div class="text-lg font-black text-blue-600 dark:text-blue-400">{{ todayStats.wordsLearned }}<span class="text-xs text-gray-400 font-normal">/{{ todayStats.wordsGoal }}</span></div>
        <div class="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">今日词汇</div>
        <div class="mt-1 h-1 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700" :style="{ width: (todayStats.wordsLearned / todayStats.wordsGoal * 100) + '%' }" />
        </div>
      </div>
      <div class="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-3 text-center shadow-sm hover:shadow-md transition-all col-span-2">
        <div class="text-2xl mb-1">✍️</div>
        <div class="text-lg font-black text-purple-600 dark:text-purple-400">{{ todayStats.essaysSubmitted }}<span class="text-xs text-gray-400 font-normal">/{{ todayStats.essaysGoal }}</span></div>
        <div class="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">今日作文</div>
        <div class="mt-1 h-1 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-700" :style="{ width: (todayStats.essaysSubmitted / todayStats.essaysGoal * 100) + '%' }" />
        </div>
      </div>
      <div class="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-3 text-center shadow-sm hover:shadow-md transition-all col-span-2">
        <div class="text-2xl mb-1">🎧</div>
        <div class="text-lg font-black text-emerald-600 dark:text-emerald-400">{{ todayStats.listeningMinutes }}<span class="text-xs text-gray-400 font-normal">/{{ todayStats.listeningGoal }}min</span></div>
        <div class="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">今日听力</div>
        <div class="mt-1 h-1 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-700" :style="{ width: (todayStats.listeningMinutes / todayStats.listeningGoal * 100) + '%' }" />
        </div>
      </div>
      <div class="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-3 text-center shadow-sm hover:shadow-md transition-all col-span-2">
        <div class="text-2xl mb-1">⚡</div>
        <div class="text-lg font-black text-amber-500">{{ todayStats.totalXp.toLocaleString() }}</div>
        <div class="text-[10px] text-gray-500 dark:text-zinc-400 mt-0.5">总经验值 <span class="text-emerald-500">+{{ todayStats.weeklyXp }}/周</span></div>
        <div class="mt-1 h-1 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700 animate-pulse-glow" :style="{ width: '68%' }" />
        </div>
      </div>
    </div>

    <div class="mt-5 flex flex-col lg:flex-row gap-5">
      <!-- Left side (3/5) -->
      <div class="w-full lg:w-3/5 space-y-5">
        <!-- Activity Heatmap -->
        <div class="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-4 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
              <span>📅</span> 学习活跃度热力图 (近20周)
            </h3>
            <div class="flex items-center gap-1 text-[9px] text-gray-400">
              <span>少</span>
              <span class="w-2.5 h-2.5 rounded-sm bg-zinc-100 dark:bg-zinc-800" />
              <span class="w-2.5 h-2.5 rounded-sm bg-blue-200 dark:bg-blue-900/40" />
              <span class="w-2.5 h-2.5 rounded-sm bg-blue-400 dark:bg-blue-700/60" />
              <span class="w-2.5 h-2.5 rounded-sm bg-blue-600 dark:bg-blue-500/80" />
              <span class="w-2.5 h-2.5 rounded-sm bg-blue-700 dark:bg-blue-400" />
              <span>多</span>
            </div>
          </div>
          <div class="flex gap-0.5 overflow-x-auto pb-1">
            <div v-for="(week, wi) in heatmapWeeks" :key="wi" class="flex flex-col gap-0.5 flex-shrink-0">
              <div
                v-for="(day, di) in week"
                :key="di"
                :class="[heatmapColor(day.intensity), 'w-3 h-3 rounded-[2px] transition-colors']"
                :title="`${day.label}: ${day.intensity < 0 ? '未来' : day.intensity + ' 小时学习'}`"
              />
            </div>
          </div>
          <div class="flex justify-between mt-2 text-[9px] text-gray-400">
            <span v-for="d in ['一','二','三','四','五','六','日']" :key="d">{{ d }}</span>
          </div>
        </div>

        <!-- Projects -->
        <div v-if="!isReviewing">
          <WorkbenchProject :items="projectItems" title="学习模块 · 九大引擎" @click="navTo" />
        </div>

        <!-- Word Review -->
        <div
          v-else
          class="bg-white dark:bg-zinc-800 rounded-xl p-8 border border-blue-200 dark:border-blue-800/30 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-blue-600 dark:text-blue-400">📝 每日词汇回顾打卡</h3>
            <button @click="isReviewing = false" class="text-gray-400 hover:text-red-500 text-sm font-bold">退出回顾</button>
          </div>
          <div class="text-center py-4">
            <h2 class="text-4xl font-black mb-2 text-gray-900 dark:text-zinc-100">{{ currentWord.word }}</h2>
            <p class="text-blue-500 font-mono mb-6">[{{ currentWord.phonetic }}]</p>
            <div v-if="showAnswer" class="bg-blue-50 dark:bg-blue-500/5 p-6 rounded-2xl text-left mb-6 border-l-4 border-blue-500">
              <p class="font-bold text-gray-800 dark:text-gray-200">{{ currentWord.meaning }}</p>
              <p class="text-sm text-gray-500 mt-2 italic">例句: {{ currentWord.example }}</p>
            </div>
            <button
              v-if="!showAnswer"
              @click="showAnswer = true"
              class="w-full py-3 border-2 border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-xl font-bold hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all"
            >
              👆 点击查看解析
            </button>
            <button
              v-else
              @click="nextWord"
              class="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              {{ wordIndex === reviewList.length - 1 ? '🎉 完成打卡' : '➡️ 下一个单词' }}
            </button>
          </div>
          <div class="mt-4 flex items-center gap-1.5 justify-center">
            <span
              v-for="(w, i) in reviewList"
              :key="i"
              class="w-2 h-2 rounded-full transition-all"
              :class="i <= wordIndex ? 'bg-blue-500 scale-110' : 'bg-gray-200 dark:bg-zinc-600'"
            />
          </div>
          <div class="mt-2 text-center text-xs text-gray-400">进度: {{ wordIndex + 1 }} / {{ reviewList.length }}</div>
        </div>

        <!-- Forum Activity -->
        <WorkbenchTrends :items="trendItems" title="🏆 英语论坛动态" />
      </div>

      <!-- Right side (2/5) -->
      <div class="w-full lg:w-2/5 space-y-5">
        <!-- Quick Nav -->
        <WorkbenchQuickNav :items="quickNavItems" title="⚡ 快捷功能入口" @click="navTo" />

        <!-- Recent Essays -->
        <div class="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-4 shadow-sm">
          <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 mb-3 flex items-center gap-2">
            <span>📄</span> 最近批改作文
          </h3>
          <div class="space-y-2">
            <div
              v-for="essay in recentEssays"
              :key="essay.id"
              class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer group"
              @click="router.push(essay.isChinese ? '/chinese-learning/writing' : '/english/essay')"
            >
              <div :class="[
                'w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
                essay.isChinese ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-blue-700',
              ]">
                {{ essay.isChinese ? '中' : 'EN' }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-gray-700 dark:text-zinc-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {{ essay.title }}
                </div>
                <div class="text-[10px] text-gray-400 flex items-center gap-2">
                  <span>{{ essay.date }}</span>
                  <span>{{ essay.words }}词</span>
                  <span :class="essay.score >= 85 ? 'text-emerald-500' : essay.score >= 70 ? 'text-blue-500' : 'text-orange-500'" class="font-bold">
                    {{ essay.score }}分
                  </span>
                </div>
              </div>
              <span class="text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                :class="essay.status === '已批改' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-zinc-700 text-gray-500'">
                {{ essay.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- To-Do List -->
        <WorkbenchTodo :items="todoItems" title="📋 备考任务清单" />

        <!-- Ability Chart -->
        <AnalysisChartCard title="🎯 能力分数分布">
          <AnalyticsVisitsSource />
        </AnalysisChartCard>

        <!-- Quick Stats -->
        <div class="bg-white dark:bg-zinc-800 rounded-xl border border-gray-200 dark:border-zinc-700 p-4 shadow-sm">
          <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 mb-3 flex items-center gap-2">
            <span>🏅</span> 学习成就速览
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 bg-blue-50 dark:bg-blue-500/5 rounded-xl text-center">
              <div class="text-2xl">🔥</div>
              <div class="text-lg font-black text-blue-600 dark:text-blue-400">{{ todayStats.streakDays }}</div>
              <div class="text-[10px] text-gray-500">连续打卡天数</div>
            </div>
            <div class="p-3 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl text-center">
              <div class="text-2xl">🎯</div>
              <div class="text-lg font-black text-emerald-600 dark:text-emerald-400">{{ todayStats.quizAccuracy }}%</div>
              <div class="text-[10px] text-gray-500">答题正确率</div>
            </div>
            <div class="p-3 bg-purple-50 dark:bg-purple-500/5 rounded-xl text-center">
              <div class="text-2xl">📝</div>
              <div class="text-lg font-black text-purple-600 dark:text-purple-400">4</div>
              <div class="text-[10px] text-gray-500">待批改作文</div>
            </div>
            <div class="p-3 bg-amber-50 dark:bg-amber-500/5 rounded-xl text-center">
              <div class="text-2xl">🏆</div>
              <div class="text-lg font-black text-amber-500">Top 15%</div>
              <div class="text-[10px] text-gray-500">全国排名</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
