<template>
  <span
    :class="[
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium',
      size === 'sm' ? 'text-[10px]' : 'text-xs',
      color === 'red' ? 'bg-chinese-50 text-chinese-600 dark:bg-chinese-500/10 dark:text-chinese-400' : 'bg-chinese-gold-50 text-chinese-gold-600 dark:bg-chinese-gold-500/10 dark:text-chinese-gold-400',
    ]"
  >
    <ruby>
      {{ character }}
      <rt class="text-[10px] font-normal">{{ pinyin }}</rt>
    </ruby>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  character: string;
  pinyin: string;
  size?: 'sm' | 'md';
  color?: 'red' | 'amber';
}>(), {
  size: 'md',
  color: 'red',
});
</script>

<style scoped>
ruby rt {
  font-size: 0.6rem;
  opacity: 0.7;
}
</style>
