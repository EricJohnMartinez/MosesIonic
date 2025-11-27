<template>
  <div class="relative w-10 h-10 sm:w-12 sm:h-12 touch-manipulation">
    <!-- Compass background circle -->
    <div class="absolute inset-0 rounded-full bg-slate-600/80 border border-slate-500/50">
      <!-- Cardinal direction markers -->
      <div class="absolute inset-1">
        <!-- North marker (red) -->
        <div class="absolute top-0 left-1/2 transform -translate-x-1/2">
          <div class="w-0.5 h-1 bg-red-500 rounded-full"></div>
        </div>
        <!-- East marker -->
        <div class="absolute right-0 top-1/2 transform -translate-y-1/2">
          <div class="w-1 h-0.5 bg-slate-400 rounded-full"></div>
        </div>
        <!-- South marker -->
        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          <div class="w-0.5 h-1 bg-slate-400 rounded-full"></div>
        </div>
        <!-- West marker -->
        <div class="absolute left-0 top-1/2 transform -translate-y-1/2">
          <div class="w-1 h-0.5 bg-slate-400 rounded-full"></div>
        </div>
      </div>
      
      <!-- Wind direction arrow -->
      <div 
        class="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
        :style="{ transform: `rotate(${windDirection}deg)` }"
      >
        <!-- Arrow pointing up (north) - rotates based on wind direction -->
        <svg class="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
          <!-- Arrow body -->
          <path d="M12 4L12 20" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/>
          <!-- Arrow head -->
          <path d="M12 4L8 10" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
          <path d="M12 4L16 10" stroke="#3b82f6" stroke-width="2" stroke-linecap="round"/>
          <!-- Arrow tail (small circle) -->
          <circle cx="12" cy="19" r="1.5" fill="#93c5fd"/>
        </svg>
      </div>
      
      <!-- Center dot -->
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div class="w-1 h-1 bg-slate-400 rounded-full"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  windDirection: {
    type: Number,
    default: 0
  },
  windSpeed: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
