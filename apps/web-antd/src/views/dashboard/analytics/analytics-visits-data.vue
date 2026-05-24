<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderEcharts({
    legend: {
      bottom: 0,
      data: ['目标水平', '当前水平'],
      textStyle: { fontSize: 10 },
    },
    radar: {
      indicator: [
        { name: '词汇储备', max: 100 },
        { name: '语法运用', max: 100 },
        { name: '听力理解', max: 100 },
        { name: '阅读速度', max: 100 },
        { name: '写作逻辑', max: 100 },
        { name: '口语流利', max: 100 },
      ],
      radius: '60%',
      splitNumber: 5,
      axisName: { fontSize: 10 },
    },
    series: [
      {
        areaStyle: {
          opacity: 1,
          shadowBlur: 0,
          shadowColor: 'rgba(0,0,0,.2)',
          shadowOffsetX: 0,
          shadowOffsetY: 10,
        },
        data: [
          {
            itemStyle: { color: '#b6a2de' },
            name: '目标水平',
            value: [95, 90, 95, 90, 90, 85],
          },
          {
            itemStyle: { color: '#5ab1ef' },
            name: '当前水平',
            value: [85, 72, 90, 65, 80, 55],
          },
        ],
        itemStyle: {
          borderRadius: 10,
          borderWidth: 2,
        },
        symbolSize: 0,
        type: 'radar',
      },
    ],
    tooltip: {},
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
