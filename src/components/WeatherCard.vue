<template>
  <div :class="['rounded-lg p-4 shadow flex flex-col items-center', alert ? 'bg-red-50 border border-red-300' : 'bg-gray-50']">
    <div class="text-3xl mb-2">{{ icon }}</div>
    <div class="font-semibold text-lg">{{ label }}</div>
    <div class="text-xl font-bold mt-1">{{ value }}</div>
    <div v-if="category" class="mt-1 text-sm px-2 py-1 rounded bg-blue-100 text-blue-700">{{ category }}</div>
    <div v-if="alert" class="mt-2 text-xs text-red-600 font-semibold animate-pulse">Alert!</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  icon: String,
  label: String,
  value: String,
  category: String,
  alert: Boolean
});
</script>
