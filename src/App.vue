<template>
  <div class="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
    <!-- Splash Screen -->
    <div 
      v-if="showSplash" 
      class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      :class="{ 'animate-fade-out': fadeOut }"
    >
      <!-- Animated background particles -->
      <div class="absolute inset-0 opacity-30">
        <div 
          v-for="i in 20" 
          :key="i"
          class="absolute w-2 h-2 bg-blue-400 rounded-full animate-pulse"
          :style="{
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            animationDelay: Math.random() * 2 + 's',
            animationDuration: (2 + Math.random() * 2) + 's'
          }"
        ></div>
      </div>
      
      <!-- Main splash content -->
      <div class="text-center relative z-10 px-8">
        <!-- Logo container with enhanced animation -->
        <div class="relative mb-8">
          <!-- Glowing backdrop -->
          <div class="absolute inset-0 w-32 h-32 mx-auto bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          
          <!-- Logo with enhanced animations -->
          <div class="relative w-24 h-24 mx-auto mb-2 transform transition-all duration-1000 animate-logo-entrance">
            <!-- Fallback icon if image fails -->
            <!-- <div class="w-full h-full bg-gradient-to-br from-blue-400 to-cyan-300 rounded-2xl flex items-center justify-center shadow-2xl">
              <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div> -->
            <!-- Uncomment when image is available -->
            <img src="/images/Moses.png" alt="MOSES Logo" class="w-full h-full object-contain drop-shadow-2xl" />
          </div>
          
          <!-- Rotating ring around logo -->
          <div class="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 border-2 border-blue-300/30 rounded-full animate-spin-slow"></div>
        </div>

        <!-- Text content with staggered animations -->
        <div class="space-y-3">
          <h1 class="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent animate-title-slide-up">
            Project GENESIS
          </h1>
          
          <div class="flex items-center justify-center space-x-2 animate-subtitle-fade-in">
            <span class="w-8 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></span>
            <p class="text-blue-200 text-lg font-medium tracking-wide">
              Powered by MOSES
            </p>
            <span class="w-8 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></span>
          </div>
          
          <p class="text-blue-100/80 text-base font-light tracking-wider animate-description-slide-up">
            Real-time Weather Monitoring System
          </p>
        </div>

        <!-- Loading indicator -->
        <div class="mt-12 animate-loader-appear">
          <div class="flex items-center justify-center space-x-1 mb-3">
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0ms;"></div>
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 150ms;"></div>
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 300ms;"></div>
          </div>
          
          <!-- Progress bar -->
          <div class="w-48 h-1 mx-auto bg-blue-900/50 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-blue-400 to-cyan-300 rounded-full animate-progress"></div>
          </div>
          
          <p class="text-blue-300/60 text-sm mt-3 animate-pulse">Initializing...</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const showSplash = ref(true);
const fadeOut = ref(false);

onMounted(() => {
  // Start fade out animation before hiding
  setTimeout(() => {
    fadeOut.value = true;
  }, 2200);
  
  // Hide splash screen
  setTimeout(() => {
    showSplash.value = false;
  }, 2800);
});
</script>

<style scoped>
/* Custom animations */
@keyframes logo-entrance {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(-90deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes title-slide-up {
  0% {
    transform: translateY(30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes subtitle-fade-in {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes description-slide-up {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes loader-appear {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes progress {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}

@keyframes fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes spin-slow {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* Apply animations */
.animate-logo-entrance {
  animation: logo-entrance 1s ease-out;
}

.animate-title-slide-up {
  animation: title-slide-up 0.8s ease-out 0.3s both;
}

.animate-subtitle-fade-in {
  animation: subtitle-fade-in 0.6s ease-out 0.6s both;
}

.animate-description-slide-up {
  animation: description-slide-up 0.6s ease-out 0.8s both;
}

.animate-loader-appear {
  animation: loader-appear 0.6s ease-out 1s both;
}

.animate-progress {
  animation: progress 2s ease-in-out infinite;
}

.animate-fade-out {
  animation: fade-out 0.6s ease-in-out;
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}
</style>