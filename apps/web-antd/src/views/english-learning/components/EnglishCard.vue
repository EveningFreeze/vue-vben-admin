<template>
  <div
    :class="[
      'en-card p-5',
      { 'en-card-hover cursor-pointer': hoverable },
    ]"
    @click="$emit('click')"
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
