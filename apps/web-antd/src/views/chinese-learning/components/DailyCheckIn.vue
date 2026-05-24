<template>
  <div class="flex items-center gap-4">
    <div class="relative">
      <div
        :class="[
          'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-all',
          isCheckedIn
            ? 'bg-gradient-to-br from-chinese-600 to-chinese-500'
            : 'bg-white dark:bg-zinc-800 border-2 border-dashed border-chinese-300 dark:border-zinc-500',
        ]"
      >
        <span v-if="!isCheckingIn && !isCheckedIn">📅</span>
        <span v-else-if="isCheckingIn" class="animate-spin text-sm text-white">⏳</span>
        <span v-else class="text-white">✅</span>
      </div>
      <div
        v-if="streakDays > 0"
        class="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-[10px] text-white font-black shadow-lg"
      >
        {{ streakDays }}
      </div>
    </div>
    <div class="flex-1 min-w-0">
      <div class="font-bold text-sm text-gray-900 dark:text-white">
        {{ isCheckedIn ? '今日已打卡' : '今日未打卡' }}
      </div>
      <div class="text-xs text-gray-500 dark:text-zinc-400 font-medium">
        {{ isCheckedIn ? `连续 ${streakDays} 天 · 明日继续` : '开启今日学习之旅' }}
      </div>
      <div v-if="bonusXp > 0 && isCheckedIn" class="text-[10px] text-chinese-gold-500 font-bold mt-0.5">
        🔥 连续 {{ streakDays }} 天 · 奖励 +{{ bonusXp }} XP
      </div>
    </div>
    <button
      v-if="!isCheckedIn"
      class="px-4 py-2.5 bg-gradient-to-r from-chinese-600 to-chinese-500 text-white rounded-xl font-bold text-xs shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex-shrink-0"
      :disabled="isCheckingIn"
      @click="checkIn"
    >
      {{ isCheckingIn ? '签到中...' : '签到' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useGamification } from '../shared/use-gamification';

const gamification = useGamification();
const isCheckingIn = ref(false);

const isCheckedIn = computed(() => gamification.isCheckedInToday());
const streakDays = computed(() => gamification.streakDays.value);

const bonusXp = computed(() => Math.min(streakDays.value * 5, 50));

function checkIn() {
  if (isCheckingIn.value || isCheckedIn.value) return;
  isCheckingIn.value = true;
  setTimeout(() => {
    const result = gamification.dailyCheckIn();
    isCheckingIn.value = false;
    if (result.earned > 0) {
      const bonusText = result.bonus ? ` (含连续签到奖励 +${Math.min(streakDays.value * 5, 50)} XP)` : '';
      message.success(`签到成功！获得 ${result.earned} XP${bonusText}`);
    }
  }, 800);
}

onMounted(() => {
  if (gamification.isCheckedInToday() && streakDays.value >= 7) {
    // Achievement check handled inside dailyCheckIn
  }
});
</script>
