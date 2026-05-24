<template>
  <div
    :class="[
      'chinese-card p-5',
      { 'chinese-card-hover cursor-pointer': hoverable },
    ]"
    @click="hoverable && $emit('click')"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  hoverable?: boolean;
}>(), {
  hoverable: false,
});

defineEmits<{
  click: [];
}>();
</script>
