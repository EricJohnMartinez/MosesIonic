<template>
  <div v-if="isVisible" class="sunlight-container">
    <!-- Ambient glow overlay -->
    <div class="ambient-glow"></div>
    
    <!-- God rays / Crepuscular rays -->
    <div class="god-rays">
      <div class="god-ray god-ray-1"></div>
      <div class="god-ray god-ray-2"></div>
      <div class="god-ray god-ray-3"></div>
      <div class="god-ray god-ray-4"></div>
      <div class="god-ray god-ray-5"></div>
      <div class="god-ray god-ray-6"></div>
      <div class="god-ray god-ray-7"></div>
      <div class="god-ray god-ray-8"></div>
    </div>
    
    <!-- Light particles -->
    <div class="light-particles">
      <div class="particle particle-1"></div>
      <div class="particle particle-2"></div>
      <div class="particle particle-3"></div>
      <div class="particle particle-4"></div>
      <div class="particle particle-5"></div>
      <div class="particle particle-6"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped>
.sunlight-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  overflow: hidden;
}

/* Ambient warm glow overlay */
.ambient-glow {
  position: absolute;
  top: -20%;
  right: -20%;
  width: 80%;
  height: 80%;
  background: radial-gradient(
    ellipse at top right,
    rgba(255, 230, 150, 0.15) 0%,
    rgba(255, 200, 100, 0.08) 30%,
    rgba(255, 220, 150, 0) 70%
  );
  animation: glow-pulse 8s ease-in-out infinite;
}

/* God rays container */
.god-rays {
  position: absolute;
  top: -10%;
  right: -10%;
  width: 100%;
  height: 120%;
  transform-origin: top right;
  animation: rays-drift 30s ease-in-out infinite alternate;
}

/* Individual god rays */
.god-ray {
  position: absolute;
  right: 0;
  top: 0;
  width: 120px;
  height: 150%;
  background: linear-gradient(
    135deg,
    rgba(255, 240, 180, 0.35) 0%,
    rgba(255, 230, 150, 0.25) 20%,
    rgba(255, 220, 130, 0.15) 40%,
    rgba(255, 210, 120, 0.05) 70%,
    rgba(255, 200, 100, 0) 100%
  );
  transform-origin: top right;
  filter: blur(25px);
  animation: ray-shine 7s ease-in-out infinite;
  mix-blend-mode: screen;
}

.god-ray-1 {
  transform: rotate(25deg);
  width: 140px;
  animation-delay: -0.5s;
}

.god-ray-2 {
  transform: rotate(35deg);
  width: 100px;
  animation-delay: -1.2s;
}

.god-ray-3 {
  transform: rotate(45deg);
  width: 160px;
  animation-delay: -2.1s;
}

.god-ray-4 {
  transform: rotate(55deg);
  width: 130px;
  animation-delay: -3.5s;
}

.god-ray-5 {
  transform: rotate(65deg);
  width: 110px;
  animation-delay: -4.8s;
}

.god-ray-6 {
  transform: rotate(75deg);
  width: 150px;
  animation-delay: -2.7s;
}

.god-ray-7 {
  transform: rotate(85deg);
  width: 120px;
  animation-delay: -1.5s;
}

.god-ray-8 {
  transform: rotate(95deg);
  width: 135px;
  animation-delay: -3.9s;
}

/* Light particles (dust particles in sunbeams) */
.light-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  filter: blur(1px);
  animation: float-particle 12s linear infinite;
  box-shadow: 0 0 8px rgba(255, 240, 200, 0.8);
}

.particle-1 {
  right: 15%;
  top: 5%;
  animation-delay: -1s;
  animation-duration: 15s;
}

.particle-2 {
  right: 25%;
  top: 8%;
  animation-delay: -3s;
  animation-duration: 18s;
  width: 2px;
  height: 2px;
}

.particle-3 {
  right: 10%;
  top: 10%;
  animation-delay: -5s;
  animation-duration: 13s;
}

.particle-4 {
  right: 20%;
  top: 3%;
  animation-delay: -7s;
  animation-duration: 16s;
  width: 2.5px;
  height: 2.5px;
}

.particle-5 {
  right: 30%;
  top: 12%;
  animation-delay: -9s;
  animation-duration: 14s;
}

.particle-6 {
  right: 12%;
  top: 15%;
  animation-delay: -11s;
  animation-duration: 17s;
  width: 2px;
  height: 2px;
}

/* Animations */
@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.05);
  }
}

@keyframes rays-drift {
  0% {
    transform: rotate(-2deg);
  }
  50% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(2deg);
  }
}

@keyframes ray-shine {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes float-particle {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(100vh) translateX(-30px) scale(0.5);
    opacity: 0;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .god-rays {
    width: 200%;
  }
  
  .god-ray {
    filter: blur(20px);
  }
  
  .ambient-glow {
    opacity: 0.8;
  }
}
</style>
