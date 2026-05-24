<template>
  <div class="chinese-page-bg min-h-screen p-6">
    <div class="fixed inset-0 pointer-events-none overflow-hidden -z-0">
      <div class="chinese-blob-1" />
      <div v-if="showBlob2" class="chinese-blob-2" />
      <div v-if="showBlob3" class="chinese-blob-3" />
    </div>
    <div class="chinese-container">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import '../shared/animations.css';

withDefaults(defineProps<{
  showBlob2?: boolean;
  showBlob3?: boolean;
}>(), {
  showBlob2: true,
  showBlob3: false,
});
</script>
