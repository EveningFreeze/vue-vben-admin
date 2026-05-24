<template>
  <div class="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
    <div class="flex items-start justify-between mb-3">
      <div :class="iconBgClass">
        <span class="text-xl">{{ icon }}</span>
      </div>
      <span
        v-if="trend"
        :class="[
          'text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5',
          trend.direction === 'up'
            ? 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400'
            : 'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400',
        ]"
      >
        {{ trend.direction === 'up' ? '↑' : '↓' }} {{ trend.percent }}%
      </span>
    </div>
    <div class="text-3xl font-black text-gray-900 dark:text-white mb-1 tabular-nums">
      {{ value }}
    </div>
    <div class="text-xs text-gray-500 dark:text-zinc-400 font-medium">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  value: number | string;
  label: string;
  icon: string;
  trend?: { direction: 'up' | 'down'; percent: number };
  color?: string;
}>();

const bgMap: Record<string, string> = {
  chinese: 'bg-chinese-50 dark:bg-chinese-500/10',
  red: 'bg-red-50 dark:bg-red-500/10',
  orange: 'bg-orange-50 dark:bg-orange-500/10',
  amber: 'bg-zinc-800 dark:bg-blue-500/10',
  emerald: 'bg-orange-50 dark:bg-orange-500/10',
  blue: 'bg-zinc-800 dark:bg-blue-500/10',
  purple: 'bg-zinc-800 dark:bg-blue-500/10',
  rose: 'bg-orange-50 dark:bg-orange-500/10',
  indigo: 'bg-zinc-800 dark:bg-blue-500/10',
};

const iconBg = computed(() => {
  const c = props.color || 'chinese';
  return bgMap[c] ?? bgMap.chinese;
});

const iconBgClass = iconBg;
</script>
