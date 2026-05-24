<template>
  <div class="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 p-5 shadow-sm">
    <h3 class="text-sm font-bold text-gray-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
      <span>🏆</span> {{ title }}
    </h3>
    <div class="space-y-2">
      <div
        v-for="(item, index) in items"
        :key="item.name"
        class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors"
      >
        <!-- Rank badge -->
        <div
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0',
            index === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm' :
            index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-sm' :
            index === 2 ? 'bg-gradient-to-br from-blue-700 to-blue-800 text-white shadow-sm' :
            'bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400',
          ]"
        >
          {{ index + 1 }}
        </div>

        <!-- Avatar placeholder -->
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-en-400 to-en-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {{ item.name.charAt(0) }}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <div class="text-sm font-bold text-gray-800 dark:text-zinc-200 truncate">{{ item.name }}</div>
          <div class="text-xs text-gray-400 dark:text-zinc-400">{{ item.desc }}</div>
        </div>

        <!-- XP -->
        <div class="text-sm font-mono font-bold text-en-600 dark:text-en-400">
          {{ item.xp }} XP
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

withDefaults(defineProps<{
  title?: string;
}>(), {
  title: '学习排行榜',
});

interface LeaderboardItem {
  name: string;
  desc: string;
  xp: number;
}

const items = ref<LeaderboardItem[]>([
  { name: '学霸小明', desc: '连续打卡 23 天', xp: 4850 },
  { name: '英语达人', desc: '累计掌握 156 词', xp: 3720 },
  { name: '努力ing', desc: '今日学习 2h', xp: 2890 },
  { name: '早起鸟', desc: '本周全勤', xp: 2150 },
  { name: '追梦人', desc: '完成 8 篇作文', xp: 1680 },
]);
</script>
