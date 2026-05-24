<template>
  <div class="en-hero p-6 md:p-8">
    <div class="flex items-start justify-between">
      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ icon }}</span>
            <h1 class="text-2xl md:text-3xl font-black tracking-tight">{{ title }}</h1>
          </div>
          <router-link
            v-if="backTo"
            :to="backTo"
            class="flex-shrink-0 px-4 py-2 bg-white/20 text-white rounded-xl text-xs font-bold hover:bg-white/30 transition-all"
          >
            ← 返回
          </router-link>
        </div>
        <p v-if="subtitle" class="text-sm opacity-80 font-medium mt-1">{{ subtitle }}</p>
      </div>
      <span
        v-if="decorativeEmoji"
        class="hidden md:block text-8xl opacity-10 -mr-4 -mt-2 flex-shrink-0"
      >{{ decorativeEmoji }}</span>
    </div>
    <div v-if="showXpBar" class="mt-6 max-w-xl">
      <XpBar />
    </div>
  </div>
</template>

<script setup lang="ts">
import XpBar from './XpBar.vue';

withDefaults(defineProps<{
  icon: string;
  title: string;
  subtitle?: string;
  backTo?: string;
  showXpBar?: boolean;
  decorativeEmoji?: string;
}>(), {
  subtitle: '',
  backTo: '',
  showXpBar: false,
  decorativeEmoji: '',
});
</script>
