<template>
  <div class="relative w-10 h-10 sm:w-12 sm:h-12 touch-manipulation">
    <!-- Compass background circle -->
    <div class="absolute inset-0 rounded-full border-2 border-gray-300 bg-white/50 backdrop-blur-sm">
      <!-- Cardinal direction markers -->
      <div class="absolute inset-0">
        <!-- North -->
        <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
          <div class="w-0.5 h-1.5 sm:w-1 sm:h-2 bg-red-500 rounded-full"></div>
        </div>
        <!-- East -->
        <div class="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2">
          <div class="w-1.5 h-0.5 sm:w-2 sm:h-1 bg-gray-400 rounded-full"></div>
        </div>
        <!-- South -->
        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1">
          <div class="w-0.5 h-1.5 sm:w-1 sm:h-2 bg-gray-400 rounded-full"></div>
        </div>
        <!-- West -->
        <div class="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2">
          <div class="w-1.5 h-0.5 sm:w-2 sm:h-1 bg-gray-400 rounded-full"></div>
        </div>
      </div>
      
      <!-- Wind direction arrow -->
      <div 
        class="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-out"
        :style="{ transform: `rotate(${windDirection}deg)` }"
      >
        <div class="relative">
          <!-- Arrow shaft -->
          <div class="w-0.5 h-3 sm:h-4 bg-blue-500 mx-auto"></div>
          <!-- Arrow head -->
          <div class="absolute -top-0.5 sm:-top-1 left-1/2 transform -translate-x-1/2">
            <div class="w-0 h-0 border-l-1 border-r-1 border-b-2 sm:border-l-2 sm:border-r-2 sm:border-b-3 border-transparent border-b-blue-600"></div>
          </div>
          <!-- Arrow tail -->
          <div class="absolute -bottom-0.5 sm:-bottom-1 left-1/2 transform -translate-x-1/2">
            <div class="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-blue-400 rounded-full"></div>
          </div>
        </div>
      </div>
      
      <!-- Center dot -->
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div class="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gray-600 rounded-full"></div>
      </div>
    </div>
    
    <!-- Wind speed indicator (optional - shows as outer glow intensity) -->
    <div 
      v-if="windSpeed > 0"
      class="absolute inset-0 rounded-full animate-pulse pointer-events-none"
      :style="glowStyle"
    ></div>
  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue'

const props = defineProps({
  windDirection: {
    type: Number,
    default: 0
  },
  windSpeed: {
    type: Number,
    default: 0
  }
})

const glowStyle = computed(() => {
  const glowRadius = Math.min(props.windSpeed * 2, 20)
  const glowOpacity = Math.min(props.windSpeed / 10, 0.6)
  return {
    boxShadow: `0 0 ${glowRadius}px rgba(59, 130, 246, ${glowOpacity})`
  }
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
