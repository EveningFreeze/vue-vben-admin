<template>
  <div class="en-page-bg min-h-screen p-6">
    <div class="fixed inset-0 pointer-events-none overflow-hidden -z-0">
      <div class="en-blob-1" />
      <div v-if="showBlob2" class="en-blob-2" />
      <div v-if="showBlob3" class="en-blob-3" />
    </div>
    <div class="en-container">
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
