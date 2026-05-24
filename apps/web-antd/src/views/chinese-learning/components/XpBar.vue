<template>
  <div class="flex items-center gap-2 w-full">
    <div class="flex-1 h-2.5 bg-chinese-900/30 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-chinese-500 to-chinese-gold-500"
        :style="{ width: progressPercent + '%' }"
      />
    </div>
    <div class="flex items-center gap-1.5 flex-shrink-0">
      <span class="text-xs font-black text-chinese-gold-400 tabular-nums">{{ xp }}</span>
      <span class="text-[10px] text-white/40">/ {{ nextLevelXp }}</span>
    </div>
    <div class="text-[10px] text-white/30 font-mono bg-white/5 px-2 py-0.5 rounded-full">
      Lv.{{ level }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGamification } from '../shared/use-gamification';

const gamification = useGamification();

const xp = computed(() => gamification.xp.value);
const level = computed(() => gamification.level.value);
const nextLevelXp = computed(() => gamification.nextLevelXp.value);
const currentLevelXp = computed(() => gamification.currentLevelXp.value);

const progressPercent = computed(() => {
  const total = nextLevelXp.value - currentLevelXp.value;
  if (total <= 0) return 100;
  return Math.min(100, ((xp.value - currentLevelXp.value) / total) * 100);
});
</script>
