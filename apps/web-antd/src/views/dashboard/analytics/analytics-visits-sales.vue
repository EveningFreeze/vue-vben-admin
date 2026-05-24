<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderEcharts({
    color: ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899'],
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} 题 ({d}%)',
    },
    legend: {
      orient: 'horizontal',
      left: 'center',
      bottom: '0',
      textStyle: { fontSize: 10 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        name: '错题专项分布',
        type: 'pie',
        radius: ['15%', '65%'],
        center: ['50%', '45%'],
        roseType: 'area',
        itemStyle: { borderRadius: 8 },
        data: [
          { name: '完形填空', value: 45 },
          { name: '非谓语动词', value: 32 },
          { name: '长难句分析', value: 28 },
          { name: '词义辨析', value: 55 },
          { name: '阅读理解', value: 38 },
          { name: '写作衔接', value: 22 },
        ].sort((a, b) => a.value - b.value),
        label: {
          show: true,
          formatter: '{b}',
          fontSize: 10,
        },
        emphasis: {
          label: {
            show: true,
            fontWeight: 'bold',
          },
        },
        animationType: 'scale',
        animationEasing: 'exponentialInOut',
        animationDelay() {
          return Math.random() * 400;
        },
      },
    ],
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
