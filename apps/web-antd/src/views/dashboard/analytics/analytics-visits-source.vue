<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderEcharts({
    color: ['#5ab1ef', '#b6a2de', '#67e0e3', '#f59e0b', '#10b981', '#ef4444'],
    legend: {
      bottom: '2%',
      left: 'center',
      textStyle: { fontSize: 9 },
    },
    series: [
      {
        animationDelay() {
          return Math.random() * 100;
        },
        animationEasing: 'exponentialInOut',
        animationType: 'scale',
        avoidLabelOverlap: false,
        data: [
          { name: '作文批改', value: 1048 },
          { name: '词汇背诵', value: 735 },
          { name: '真题阅读', value: 580 },
          { name: '听力训练', value: 484 },
          { name: '语法专项', value: 320 },
          { name: '口语练习', value: 210 },
        ],
        name: '学习时长分布',
        emphasis: {
          label: {
            fontSize: '12',
            fontWeight: 'bold',
            show: true,
          },
        },
        itemStyle: {
          borderRadius: 10,
          borderWidth: 2,
        },
        label: {
          position: 'center',
          show: false,
        },
        labelLine: {
          show: false,
        },
        radius: ['35%', '65%'],
        type: 'pie',
      },
    ],
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} min ({d}%)',
    },
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
