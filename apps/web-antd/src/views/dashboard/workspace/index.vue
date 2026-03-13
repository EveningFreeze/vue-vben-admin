<script lang="ts" setup>
import type {
  WorkbenchProjectItem,
  WorkbenchQuickNavItem,
  WorkbenchTodoItem,
  WorkbenchTrendItem,
} from '@vben/common-ui';

import { ref, computed } from 'vue'; // 引入 computed 处理单词逻辑
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

// --- 新增：打卡回顾功能相关的状态 ---
const isReviewing = ref(false);  // 控制是否显示回顾界面
const wordIndex = ref(0);        // 当前单词索引
const showAnswer = ref(false);   // 是否显示答案

// 模拟的复习单词数据
const reviewList = [
  { word: 'Algorithm', phonetic: 'ˈælɡərɪðəm', meaning: 'n. 算法', example: 'The algorithm optimizes the deployment of NAO robots.' },
  { word: 'Framework', phonetic: 'ˈfreɪmwɜːrk', meaning: 'n. 框架，结构', example: 'We are using the Odoo framework for lab management.' },
  { word: 'Synchronize', phonetic: 'ˈsɪŋkrənaɪz', meaning: 'v. 同步', example: 'The system helps synchronize dance movements across multiple robots.' }
];

const currentWord = computed(() => reviewList[wordIndex.value]);

// 开始打卡回顾
const handleStartReview = () => {
  wordIndex.value = 0;
  showAnswer.value = false;
  isReviewing.value = true;
};

// 下一个单词
const nextWord = () => {
  if (wordIndex.value < reviewList.length - 1) {
    wordIndex.value++;
    showAnswer.value = false;
  } else {
    message.success('今日打卡回顾已完成！');
    isReviewing.value = false;
  }
};
// --------------------------------

const projectItems: WorkbenchProjectItem[] = [
  {
    color: '#1890ff',
    content: '基于 Gemini AI 的全维度英语作文批改，支持衡水体扫描识别。',
    date: '进行中',
    group: '核心引擎',
    icon: 'ant-design:edit-outlined',
    title: '作文批改',
    url: '/english/essay',
  },
  {
    color: '#3fb27f',
    content: '个性化词汇测试，涵盖四六级、雅思、托福核心词库。',
    date: '已更新',
    group: '能力评估',
    icon: 'ant-design:book-outlined',
    title: '词汇闯关',
    url: '/english/quiz',
  },
  {
    color: '#e18525',
    content: '通过 AI 算法生成的 12 周备考冲刺计划。',
    date: '待查看',
    group: '备考指南',
    icon: 'ant-design:calendar-outlined',
    title: '备考规划',
    url: '/english/report',
  },
  {
    color: '#bf0c2c',
    content: '记录所有练习中的失分点，AI 辅助深度记忆。',
    date: '活跃',
    group: '复习工具',
    icon: 'ant-design:file-exclamation-outlined',
    title: '智能错词',
    url: '/english/report',
  },
  {
    color: '#00d8ff',
    content: '全球英语学习者交流社区，分享高分范文。',
    date: '2k+ 在线',
    group: '互动社区',
    icon: 'ant-design:message-outlined',
    title: '英语论坛',
    url: '#',
  },
  {
    color: '#EBD94E',
    content: '实时检测衡水体书写规范度，提供视觉纠偏建议。',
    date: 'V2.0',
    group: '专项突破',
    icon: 'ant-design:form-outlined',
    title: '书法纠偏',
    url: '/english/essay',
  },
];

const quickNavItems: WorkbenchQuickNavItem[] = [
  { color: '#1fdaca', icon: 'ant-design:dashboard-outlined', title: '学情大屏', url: '/dashboard/analysis' },
  { color: '#bf0c2c', icon: 'ant-design:read-outlined', title: '今日阅读', url: '/english/essay' },
  { color: '#e18525', icon: 'ant-design:audio-outlined', title: '听力训练', url: '#' },
  { color: '#3fb27f', icon: 'ant-design:customer-service-outlined', title: 'AI 语伴', url: '#' },
  { color: '#4daf1bc9', icon: 'ant-design:star-outlined', title: '高频考点', url: '#' },
  { color: '#00d8ff', icon: 'ant-design:bar-chart-outlined', title: '能力分布', url: '/english/report' },
];

const todoItems = ref<WorkbenchTodoItem[]>([
  { completed: false, content: `完成 2026 年 6 月大学英语六级模拟套卷的听力部分。`, date: '2026-03-12 10:00:00', title: '模拟套卷训练' },
  { completed: true, content: `通过 AI 批改中心提交一篇关于“人工智能”的主题作文。`, date: '2026-03-11 15:00:00', title: '范文练习提交' },
  { completed: false, content: `复习错词本中标记为“高频遗忘”的 50 个词汇。 `, date: '2026-03-12 20:00:00', title: '错词深度复习' },
  { completed: false, content: `整理衡水体书写中的常见连笔错误，对比 AI 评分建议进行修正。`, date: '2024-03-13 11:00:00', title: '书法规范纠正' },
]);

const trendItems: WorkbenchTrendItem[] = [
  { avatar: 'svg:avatar-1', content: `在 <a>精选范文</a> 发布了 <a>《如何在高难度作文中保持句式多样性》</a>`, date: '刚刚', title: 'Teacher Wang' },
  { avatar: 'svg:avatar-2', content: `关注了你的 <a>备考日志</a> 并点赞 `, date: '2小时前', title: '李华' },
  { avatar: 'svg:avatar-3', content: `在 <a>词汇排行榜</a> 中超越了 98% 的用户 `, date: '1天前', title: '克里斯' },
  { avatar: 'svg:avatar-4', content: `发布了新文章 <a>衡水体书写的 3 个核心技巧</a> `, date: '2天前', title: '智启英语 AI' },
  { avatar: 'svg:avatar-1', content: `回复了 <a>杰克</a> 的问题 <a>独立主格结构如何应用？</a>`, date: '3天前', title: '英语专业组' },
];

function navTo(nav: WorkbenchProjectItem | WorkbenchQuickNavItem) {
  if (nav.url?.startsWith('http')) {
    openWindow(nav.url);
    return;
  }
  if (nav.url?.startsWith('/')) {
    router.push(nav.url).catch((err) => console.error(err));
  }
}
</script>

<template>
  <div class="p-5">
    <WorkbenchHeader
      :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
    >
      <template #title>
        早安, {{ userStore.userInfo?.realName }}, 今天也是提升英语的好机会！
      </template>
      <template #description> 
        <div class="flex items-center gap-4">
          <span>今日学习提醒：你已经连续坚持打卡 15 天。</span>
          <button 
            @click="handleStartReview"
            class="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
          >
            开始今日回顾 (打卡)
          </button>
        </div>
      </template>
    </WorkbenchHeader>

    <div class="mt-5 flex flex-col lg:flex-row">
      <div class="mr-4 w-full lg:w-3/5">
        
        <div v-if="!isReviewing">
          <WorkbenchProject :items="projectItems" title="英语学习模块" @click="navTo" />
        </div>
        
        <div v-else class="bg-white dark:bg-[#18181b] rounded-xl p-8 border border-indigo-200 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-indigo-600">今日词汇回顾打卡</h3>
            <button @click="isReviewing = false" class="text-gray-400 hover:text-red-500">退出</button>
          </div>
          
          <div class="text-center py-4">
            <h2 class="text-4xl font-black mb-2">{{ currentWord.word }}</h2>
            <p class="text-indigo-400 font-mono mb-6">[{{ currentWord.phonetic }}]</p>
            
            <div v-if="showAnswer" class="bg-slate-50 dark:bg-zinc-900 p-6 rounded-2xl text-left mb-6 border-l-4 border-indigo-500">
              <p class="font-bold text-gray-800 dark:text-gray-200">{{ currentWord.meaning }}</p>
              <p class="text-sm text-gray-500 mt-2 italic">例句: {{ currentWord.example }}</p>
            </div>

            <button 
              v-if="!showAnswer" 
              @click="showAnswer = true" 
              class="w-full py-3 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all"
            >
              点击查看解析
            </button>
            <button 
              v-else 
              @click="nextWord" 
              class="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md"
            >
              {{ wordIndex === reviewList.length - 1 ? '完成打卡' : '下一个' }}
            </button>
          </div>
          <div class="mt-6 text-center text-xs text-gray-400">进度: {{ wordIndex + 1 }} / {{ reviewList.length }}</div>
        </div>

        <WorkbenchTrends :items="trendItems" class="mt-5" title="英语论坛动态" />
      </div>
      
      <div class="w-full lg:w-2/5">
        <WorkbenchQuickNav
          :items="quickNavItems"
          class="mt-5 lg:mt-0"
          title="功能快捷导航"
          @click="navTo"
        />
        <WorkbenchTodo :items="todoItems" class="mt-5" title="我的备考清单" />
        <AnalysisChartCard class="mt-5" title="能力分数分布">
          <AnalyticsVisitsSource />
        </AnalysisChartCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 简单的进入动画 */
.animate-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
