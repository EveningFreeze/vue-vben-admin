import { ref, computed } from 'vue';

export function useStudyTimer() {
  const seconds = ref(0);
  const isRunning = ref(false);
  let interval: ReturnType<typeof setInterval> | null = null;

  function start() {
    if (isRunning.value) return;
    isRunning.value = true;
    interval = setInterval(() => { seconds.value++; }, 1000);
  }

  function pause() {
    if (!interval) return;
    clearInterval(interval);
    interval = null;
    isRunning.value = false;
  }

  function reset() {
    pause();
    seconds.value = 0;
  }

  function stopAndRecord(): number {
    pause();
    const minutes = Math.floor(seconds.value / 60);
    seconds.value = 0;
    return minutes;
  }

  const formattedTime = computed(() => {
    const m = Math.floor(seconds.value / 60);
    const s = seconds.value % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  });

  return { seconds, isRunning, formattedTime, start, pause, reset, stopAndRecord };
}
