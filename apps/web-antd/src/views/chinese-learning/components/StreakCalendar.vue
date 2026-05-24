<template>
  <div class="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-5 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
        <span class="w-1.5 h-4 bg-chinese-500 rounded-full" />
        打卡日历
      </h3>
      <span class="text-xs text-gray-400 font-mono">{{ currentMonth }}</span>
    </div>
    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-[10px] text-gray-400 font-bold py-1"
      >
        {{ day }}
      </div>
      <div
        v-for="(day, idx) in calendarDays"
        :key="idx"
        :class="[
          'text-center py-1.5 text-xs rounded-lg font-medium transition-all',
          day.checked
            ? 'bg-gradient-to-br from-chinese-600 to-chinese-500 text-white font-bold shadow-sm'
            : day.isToday
              ? 'bg-chinese-50 dark:bg-chinese-500/10 text-chinese-600 dark:text-chinese-400 font-bold ring-1 ring-chinese-300 dark:ring-chinese-500/30'
              : day.isEmpty
                ? 'text-transparent'
                : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700',
        ]"
      >
        {{ day.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGamification } from '../shared/use-gamification';

const gamification = useGamification();

const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

const currentMonth = computed(() => {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
});

interface CalendarDay {
  label: string;
  isEmpty: boolean;
  isToday: boolean;
  checked: boolean;
}

const calendarDays = computed<CalendarDay[]>(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  const history = gamification.checkInHistory.value;

  const days: CalendarDay[] = [];
  const emptyStart = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < emptyStart; i++) {
    days.push({ label: '', isEmpty: true, isToday: false, checked: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      label: String(d),
      isEmpty: false,
      isToday: d === today,
      checked: history.includes(dateStr),
    });
  }
  return days;
});
</script>
