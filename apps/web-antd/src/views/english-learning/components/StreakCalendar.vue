<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h4 class="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">打卡记录</h4>
      <span class="text-[10px] text-gray-400 font-mono">近 {{ displayDays }} 天</span>
    </div>
    <div class="grid grid-cols-7 gap-1.5">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="[
          'w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all',
          day.checked
            ? 'bg-en-500 dark:bg-en-600 text-white shadow-sm shadow-en-500/30'
            : day.isToday
              ? 'bg-en-50 dark:bg-en-500/20 text-en-600 dark:text-en-400 ring-2 ring-en-400/50'
              : day.isFuture
                ? 'bg-transparent border border-dashed border-slate-200 dark:border-zinc-600 text-slate-300 dark:text-zinc-700'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-300 dark:text-zinc-400',
        ]"
        :title="day.label"
      >
        {{ day.date.getDate() }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGamification } from '../shared/use-gamification';

const props = withDefaults(defineProps<{
  days?: 7 | 14 | 30;
}>(), {
  days: 14,
});

const gamification = useGamification();

const displayDays = computed(() => props.days);

const calendarDays = computed(() => {
  const today = new Date();
  const days: { date: Date; checked: boolean; isToday: boolean; isFuture: boolean; label: string }[] = [];

  for (let i = props.days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = (date.toISOString().split('T')[0] ?? '');
    const isToday = i === 0;
    const isFuture = i < 0;

    days.push({
      date,
      checked: gamification.checkInHistory.value.includes(dateStr) && !isFuture,
      isToday,
      isFuture,
      label: dateStr,
    });
  }

  return days;
});
</script>
