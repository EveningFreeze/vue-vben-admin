<template>
  <div
    :class="[
      'relative rounded-2xl border p-5 transition-all duration-300 overflow-hidden',
      isUnlocked
        ? 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 hover:shadow-lg'
        : 'bg-slate-50 dark:bg-zinc-700/50 border-gray-100 dark:border-zinc-700/50 grayscale opacity-60',
    ]"
  >
    <div
      v-if="justUnlocked"
      class="absolute inset-0 bg-chinese-500/10 rounded-2xl animate-pulse pointer-events-none"
    />

    <div class="flex items-center gap-4">
      <div
        :class="[
          'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner flex-shrink-0',
          isUnlocked ? 'bg-gradient-to-br from-chinese-50 to-chinese-gold-50 dark:from-chinese-500/10 dark:to-chinese-gold-500/10' : 'bg-slate-100 dark:bg-zinc-800',
        ]"
      >
        {{ achievement.icon }}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 mb-0.5">
          <h4 class="font-bold text-sm text-gray-900 dark:text-zinc-100">{{ achievement.title }}</h4>
          <span
            v-if="isUnlocked"
            class="text-[10px] text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400 px-2 py-0.5 rounded-full font-bold"
          >
            ✅ 已获得
          </span>
        </div>
        <p class="text-xs text-gray-500 dark:text-zinc-400">{{ achievement.description }}</p>
        <div v-if="!isUnlocked && achievement.progress > 0" class="mt-2">
          <div class="h-1.5 w-full bg-slate-200 dark:bg-zinc-600 rounded-full overflow-hidden">
            <div
              class="h-full bg-chinese-gold-500 rounded-full transition-all duration-500"
              :style="{ width: achievement.progress + '%' }"
            />
          </div>
        </div>
        <div v-if="!isUnlocked" class="text-[10px] text-gray-400 mt-1 font-medium">
          奖励 {{ achievement.xpReward }} XP
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ChineseAchievement } from '../shared/types';

const props = defineProps<{
  achievement: ChineseAchievement;
}>();

const isUnlocked = computed(() => !!props.achievement.unlockedAt);
const justUnlocked = computed(() => {
  if (!props.achievement.unlockedAt) return false;
  const diff = Date.now() - new Date(props.achievement.unlockedAt).getTime();
  return diff < 30000;
});
</script>
