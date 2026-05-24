<template>
  <button
    :class="[
      'inline-flex items-center justify-center rounded-full transition-all active:scale-90',
      isSpeaking
        ? 'ring-2 ring-en-400 bg-en-100 dark:bg-en-500/20 animate-pulse shadow-lg shadow-en-500/20'
        : 'hover:scale-110 bg-slate-100 dark:bg-zinc-800 hover:bg-en-100 dark:hover:bg-en-500/20 hover:shadow-md',
      sizeClass,
    ]"
    :title="supported ? '点击发音' : '浏览器不支持语音合成'"
    :disabled="!supported"
    @click="handleSpeak"
  >
    <span v-if="isSpeaking" class="text-en-500 text-sm">🔊</span>
    <span v-else class="text-slate-400 dark:text-slate-500 text-sm">🔈</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSpeech } from '../shared/use-speech';

const props = withDefaults(defineProps<{
  word: string;
  size?: 'sm' | 'md' | 'lg';
}>(), {
  size: 'sm',
});

const { isSpeaking, supported, speak } = useSpeech();

const sizeClass = computed(() => ({
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}[props.size]));

function handleSpeak() {
  if (supported) speak(props.word);
}
</script>
