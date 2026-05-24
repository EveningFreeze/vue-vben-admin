<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderEcharts({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: ['词汇练习', '作文批改', '听力训练', '语法练习'],
      bottom: 0,
      textStyle: { fontSize: 10 },
    },
    grid: {
      bottom: 30,
      containLabel: true,
      left: '1%',
      right: '4%',
      top: '2%',
    },
    xAxis: {
      axisTick: { show: false },
      boundaryGap: false,
      data: Array.from({ length: 18 }).map((_item, index) => `${index + 6}:00`),
      splitLine: { lineStyle: { type: 'dashed' }, show: true },
      type: 'category',
    },
    yAxis: [{
      axisTick: { show: false },
      max: 80,
      splitArea: { show: true },
      splitNumber: 4,
      type: 'value',
      name: '活跃度 (次)',
    }],
    series: [
      {
        name: '词汇练习',
        areaStyle: { opacity: 0.15 },
        data: [5, 12, 25, 30, 42, 55, 48, 38, 22, 15, 10, 8, 5, 3, 2, 1, 0, 0],
        itemStyle: { color: '#5ab1ef' },
        smooth: true,
        type: 'line',
      },
      {
        name: '作文批改',
        areaStyle: { opacity: 0.15 },
        data: [0, 1, 3, 8, 15, 22, 30, 25, 18, 12, 8, 5, 3, 2, 1, 0, 0, 0],
        itemStyle: { color: '#b6a2de' },
        smooth: true,
        type: 'line',
      },
      {
        name: '听力训练',
        areaStyle: { opacity: 0.15 },
        data: [0, 2, 5, 10, 18, 28, 35, 40, 30, 20, 12, 8, 5, 4, 2, 1, 0, 0],
        itemStyle: { color: '#f59e0b' },
        smooth: true,
        type: 'line',
      },
      {
        name: '语法练习',
        areaStyle: { opacity: 0.15 },
        data: [2, 8, 15, 25, 35, 40, 32, 20, 15, 10, 8, 5, 3, 2, 1, 0, 0, 0],
        itemStyle: { color: '#10b981' },
        smooth: true,
        type: 'line',
      },
    ],
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
