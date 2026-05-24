<template>
  <div class="flex items-center gap-4">
    <!-- Level badge -->
    <div class="relative flex-shrink-0">
      <div class="w-12 h-12 rounded-full bg-gradient-to-br from-en-500 to-en-cyan-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-en-500/20">
        {{ level }}
      </div>
      <span class="absolute -bottom-1 -right-1 text-[10px] bg-en-cyan-500 text-white px-1 rounded font-bold leading-tight">LV</span>
    </div>

    <!-- XP bar -->
    <div class="flex-1 min-w-0">
      <div class="flex justify-between text-xs mb-1">
        <span class="font-bold text-gray-600 dark:text-zinc-400">经验值</span>
        <span class="font-mono text-gray-500 dark:text-zinc-400">{{ displayXp }} / {{ nextLevelXp }} XP</span>
      </div>
      <div class="h-3 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
        <div
          class="h-full rounded-full bg-gradient-to-r from-en-500 to-en-cyan-500 transition-all duration-1000 ease-out shadow-sm"
          :style="{ width: progress + '%' }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGamification } from '../shared/use-gamification';

const gamification = useGamification();

const level = computed(() => gamification.level.value);
const displayXp = computed(() => gamification.xp.value);
const nextLevelXp = computed(() => gamification.nextLevelXp.value);
const progress = computed(() => Math.min(100, Math.max(0, gamification.levelProgress.value)));
</script>
