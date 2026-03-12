<script lang="ts" setup>
import type {
  WorkbenchProjectItem,
  WorkbenchQuickNavItem,
  WorkbenchTodoItem,
  WorkbenchTrendItem,
} from '@vben/common-ui';

import { ref } from 'vue';
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

import AnalyticsVisitsSource from '../analytics/analytics-visits-source.vue';

const userStore = useUserStore();
const router = useRouter();

// 英语学习模块：替换原有的开源项目
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

// 快捷导航：英语功能入口
const quickNavItems: WorkbenchQuickNavItem[] = [
  {
    color: '#1fdaca',
    icon: 'ant-design:dashboard-outlined',
    title: '学情大屏',
    url: '/dashboard/analysis',
  },
  {
    color: '#bf0c2c',
    icon: 'ant-design:read-outlined',
    title: '今日阅读',
    url: '/english/essay',
  },
  {
    color: '#e18525',
    icon: 'ant-design:audio-outlined',
    title: '听力训练',
    url: '#',
  },
  {
    color: '#3fb27f',
    icon: 'ant-design:customer-service-outlined',
    title: 'AI 语伴',
    url: '#',
  },
  {
    color: '#4daf1bc9',
    icon: 'ant-design:star-outlined',
    title: '高频考点',
    url: '#',
  },
  {
    color: '#00d8ff',
    icon: 'ant-design:bar-chart-outlined',
    title: '能力分布',
    url: '/english/report',
  },
];

// 英语备考待办事项
const todoItems = ref<WorkbenchTodoItem[]>([
  {
    completed: false,
    content: `完成 2026 年 6 月大学英语六级模拟套卷的听力部分。`,
    date: '2026-03-12 10:00:00',
    title: '模拟套卷训练',
  },
  {
    completed: true,
    content: `通过 AI 批改中心提交一篇关于“人工智能”的主题作文。`,
    date: '2026-03-11 15:00:00',
    title: '范文练习提交',
  },
  {
    completed: false,
    content: `复习错词本中标记为“高频遗忘”的 50 个词汇。 `,
    date: '2026-03-12 20:00:00',
    title: '错词深度复习',
  },
  {
    completed: false,
    content: `整理衡水体书写中的常见连笔错误，对比 AI 评分建议进行修正。`,
    date: '2024-03-13 11:00:00',
    title: '书法规范纠正',
  },
]);

// 社区与动态：英语论坛
const trendItems: WorkbenchTrendItem[] = [
  {
    avatar: 'svg:avatar-1',
    content: `在 <a>精选范文</a> 发布了 <a>《如何在高难度作文中保持句式多样性》</a>`,
    date: '刚刚',
    title: 'Teacher Wang',
  },
  {
    avatar: 'svg:avatar-2',
    content: `关注了你的 <a>备考日志</a> 并点赞 `,
    date: '2小时前',
    title: '李华',
  },
  {
    avatar: 'svg:avatar-3',
    content: `在 <a>词汇排行榜</a> 中超越了 98% 的用户 `,
    date: '1天前',
    title: '克里斯',
  },
  {
    avatar: 'svg:avatar-4',
    content: `发布了新文章 <a>衡水体书写的 3 个核心技巧</a> `,
    date: '2天前',
    title: '智启英语 AI',
  },
  {
    avatar: 'svg:avatar-1',
    content: `回复了 <a>杰克</a> 的问题 <a>独立主格结构如何应用？</a>`,
    date: '3天前',
    title: '英语专业组',
  },
];

function navTo(nav: WorkbenchProjectItem | WorkbenchQuickNavItem) {
  if (nav.url?.startsWith('http')) {
    openWindow(nav.url);
    return;
  }
  if (nav.url?.startsWith('/')) {
    router.push(nav.url).catch((error) => {
      console.error('Navigation failed:', error);
    });
  } else {
    console.warn(`Unknown URL for navigation item: ${nav.title} -> ${nav.url}`);
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
        今日学习提醒：你已经连续坚持打卡 15 天，再坚持 6 天可获得“毅力达人”勋章！
      </template>
    </WorkbenchHeader>

    <div class="mt-5 flex flex-col lg:flex-row">
      <div class="mr-4 w-full lg:w-3/5">
        <WorkbenchProject :items="projectItems" title="英语学习模块" @click="navTo" />
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
