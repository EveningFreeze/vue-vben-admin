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
      axisPointer: { type: 'shadow' },
    },
    legend: {
      data: ['月度平均分', '上月对比'],
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
      data: Array.from({ length: 12 }).map((_item, index) => `${index + 1}月`),
      type: 'category',
    },
    yAxis: {
      max: 100,
      splitNumber: 5,
      type: 'value',
      name: '分数',
    },
    series: [
      {
        name: '月度平均分',
        barMaxWidth: 40,
        data: [62, 65, 68, 70, 72, 75, 78, 76, 80, 82, 85, 88],
        type: 'bar',
        itemStyle: {
          color: '#3b82f6',
          borderRadius: [6, 6, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          fontWeight: 'bold',
          color: '#3b82f6',
        },
      },
      {
        name: '上月对比',
        barMaxWidth: 40,
        data: [58, 60, 63, 66, 68, 70, 73, 75, 77, 79, 80, 82],
        type: 'bar',
        itemStyle: {
          color: '#93c5fd',
          borderRadius: [6, 6, 0, 0],
        },
      },
    ],
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
