
<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-b from-blue-200 to-blue-500">
    <!-- Splash Screen -->
    <div v-if="showSplash" class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-blue-400 to-blue-900">
      <div class="text-center">
        <img src="/images/Moses.png " alt="Splash Logo" class="w-24 h-24 mx-auto animate-bounce" />
        <h1 class="text-3xl font-bold text-white mt-4">Project Moses</h1>
        <p class="text-white mt-2">Real-time Weather Monitoring</p>
      </div>
    </div>

    <!-- Main Content -->
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const showSplash = ref(true);

onMounted(() => {
  setTimeout(() => {
    showSplash.value = false;
  }, 1800);
});
</script>
