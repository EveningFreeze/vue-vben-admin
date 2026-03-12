<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderEcharts({
    // 增加全局颜色配置，确保风格统一
    color: ['#5ab1ef', '#b6a2de', '#67e0e3', '#2ec7c9', '#ffb980'],
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    // 增加图例，防止用户看不清较小的扇区
    legend: {
      orient: 'horizontal',
      left: 'center',
      bottom: '0',
      textStyle: {
        fontSize: 10,
      },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        name: '错题专项分布',
        type: 'pie',
        // 关键修复点 1：减小半径从 80% 到 60%，为文字标签留出空间
        // 使用内外圆半径，增加视觉上的层次感
        radius: ['15%', '65%'], 
        // 关键修复点 2：调整中心点，稍微上移为底部的图例留出位置
        center: ['50%', '45%'],
        roseType: 'area', // 玫瑰图模式，面积代表数值
        itemStyle: {
          borderRadius: 8,
        },
        data: [
          { name: '完形填空', value: 45 },
          { name: '非谓语动词', value: 32 },
          { name: '长难句分析', value: 28 },
          { name: '词义辨析', value: 55 },
        ].sort((a, b) => a.value - b.value),
        // 关键修复点 3：优化标签布局
        label: {
          show: true,
          formatter: '{b}',
          fontSize: 11,
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
