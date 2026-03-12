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
    },
    radar: {
      indicator: [
        {
          name: '词汇储备',
        },
        {
          name: '语法运用',
        },
        {
          name: '听力理解',
        },
        {
          name: '阅读速度',
        },
        {
          name: '写作逻辑',
        },
        {
          name: '口语流利',
        },
      ],
      radius: '60%',
      splitNumber:5,
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
            itemStyle: {
              color: '#b6a2de',
            },
            name: '目标水平',
            value: [95, 90, 95, 90, 90, 85],
          },
          {
            itemStyle: {
              color: '#5ab1ef',
            },
            name: '当前水平',
            value: [85, 72, 90, 65, 80, 55],
          },
        ],
        itemStyle: {
          // borderColor: '#fff',
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
