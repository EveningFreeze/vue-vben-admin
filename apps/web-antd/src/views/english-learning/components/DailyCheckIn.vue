<template>
  <div class="flex flex-col items-center gap-2">
    <button
      :class="[
        'relative px-8 py-4 rounded-2xl font-bold text-base shadow-lg transition-all select-none',
        checkedIn
          ? 'bg-gradient-to-r from-en-500 to-en-600 text-white shadow-en-glow cursor-default'
          : 'bg-gradient-to-r from-en-600 to-en-cyan-500 text-white shadow-en-cyan-500/30 hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer',
      ]"
      :disabled="checkedIn"
      @click="handleCheckIn"
    >
      <span v-if="checkedIn" class="flex items-center gap-2">
        <span>✅</span> 今日已打卡
      </span>
      <span v-else class="flex items-center gap-2">
        <span class="animate-bounce">🔥</span> 签到打卡
      </span>
    </button>

    <div v-if="checkedIn" class="text-xs text-en-600 dark:text-en-400 font-bold">
      已连续打卡 <span class="text-lg">{{ streak }}</span> 天
    </div>
    <div v-else class="text-xs text-en-cyan-600 dark:text-en-cyan-400 font-bold">
      连续打卡 {{ streak }} 天 · 签到得 {{ 10 + Math.min(streak * 5, 50) }} XP
    </div>

    <!-- XP earned notification -->
    <Transition name="xp-pop">
      <div
        v-if="showXpNotification"
        class="absolute -top-8 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap"
      >
        +{{ lastEarned }} XP
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGamification } from '../shared/use-gamification';

const gamification = useGamification();
const checkedIn = ref(gamification.isCheckedInToday());
const showXpNotification = ref(false);
const lastEarned = ref(0);
const streak = ref(gamification.streakDays.value);

function handleCheckIn() {
  if (checkedIn.value) return;
  const result = gamification.dailyCheckIn();
  if (result.earned > 0) {
    lastEarned.value = result.earned;
    showXpNotification.value = true;
    checkedIn.value = true;
    streak.value = gamification.streakDays.value;

    // Check first check-in achievement
    gamification.unlockAchievement('first-checkin');

    setTimeout(() => { showXpNotification.value = false; }, 2000);
  }
}
</script>

<style scoped>
.xp-pop-enter-active { animation: popIn 0.3s ease-out; }
.xp-pop-leave-active { animation: popIn 0.2s ease-in reverse; }
@keyframes popIn {
  from { opacity: 0; transform: translateX(-50%) translateY(10px) scale(0.8); }
  to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
}
</style>
