<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { TabOption } from '@vben/types';

import {
  AnalysisChartCard,
  AnalysisChartsTabs,
  AnalysisOverview,
} from '@vben/common-ui';
// 保留原有图标，赋予新的业务含义
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

const overviewItems: AnalysisOverviewItem[] = [
  {
    icon: SvgCardIcon,
    title: '掌握词汇',
    totalTitle: '目标词汇',
    totalValue: 6000,
    value: 3452,
  },
  {
    icon: SvgCakeIcon,
    title: '批改作文',
    totalTitle: '累计作文量',
    totalValue: 200,
    value: 48,
  },
  {
    icon: SvgDownloadIcon,
    title: '练习时长(min)',
    totalTitle: '本周目标',
    totalValue: 1000,
    value: 620,
  },
  {
    icon: SvgBellIcon,
    title: '全国排名',
    totalTitle: '同省排名',
    totalValue: 5000,
    value: 1280,
  },
];

const chartTabs: TabOption[] = [
  {
    label: '学习活跃度',
    value: 'trends',
  },
  {
    label: '月度提分趋势',
    value: 'visits',
  },
];
</script>

<template>
  <div class="p-5">
    <AnalysisOverview :items="overviewItems" />
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <AnalyticsTrends />
      </template>
      <template #visits>
        <AnalyticsVisits />
      </template>
    </AnalysisChartsTabs>

    <div class="mt-5 w-full md:flex">
      <AnalysisChartCard class="mt-5 md:mt-0 md:mr-4 md:w-1/3" title="英语核心能力分布">
        <AnalyticsVisitsData />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:mr-4 md:w-1/3" title="学习任务占比">
        <AnalyticsVisitsSource />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="错题专项分布">
        <AnalyticsVisitsSales />
      </AnalysisChartCard>
    </div>
  </div>
</template>
