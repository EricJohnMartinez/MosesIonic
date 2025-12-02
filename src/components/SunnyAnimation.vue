<template>
  <div v-if="isVisible" class="sunlight-container">
    <!-- Atmospheric haze layer -->
    <div class="atmospheric-haze"></div>
    
    <!-- Sun orb glow -->
    <div class="sun-source">
      <div class="sun-core"></div>
      <div class="sun-corona"></div>
    </div>
    
    <!-- Primary volumetric god rays - dense array -->
    <div class="godray-layer primary-rays">
      <div class="volumetric-ray ray-1"></div>
      <div class="volumetric-ray ray-2"></div>
      <div class="volumetric-ray ray-3"></div>
      <div class="volumetric-ray ray-4"></div>
      <div class="volumetric-ray ray-5"></div>
      <div class="volumetric-ray ray-6"></div>
      <div class="volumetric-ray ray-7"></div>
      <div class="volumetric-ray ray-8"></div>
      <div class="volumetric-ray ray-9"></div>
      <div class="volumetric-ray ray-10"></div>
      <div class="volumetric-ray ray-11"></div>
      <div class="volumetric-ray ray-12"></div>
    </div>
    
    <!-- Secondary subtle rays - even more -->
    <div class="godray-layer secondary-rays">
      <div class="soft-ray soft-1"></div>
      <div class="soft-ray soft-2"></div>
      <div class="soft-ray soft-3"></div>
      <div class="soft-ray soft-4"></div>
      <div class="soft-ray soft-5"></div>
      <div class="soft-ray soft-6"></div>
      <div class="soft-ray soft-7"></div>
      <div class="soft-ray soft-8"></div>
      <div class="soft-ray soft-9"></div>
      <div class="soft-ray soft-10"></div>
      <div class="soft-ray soft-11"></div>
      <div class="soft-ray soft-12"></div>
      <div class="soft-ray soft-13"></div>
      <div class="soft-ray soft-14"></div>
      <div class="soft-ray soft-15"></div>
    </div>
    
    <!-- Tertiary fine rays - background fill -->
    <div class="godray-layer tertiary-rays">
      <div class="fine-ray fine-1"></div>
      <div class="fine-ray fine-2"></div>
      <div class="fine-ray fine-3"></div>
      <div class="fine-ray fine-4"></div>
      <div class="fine-ray fine-5"></div>
      <div class="fine-ray fine-6"></div>
      <div class="fine-ray fine-7"></div>
      <div class="fine-ray fine-8"></div>
      <div class="fine-ray fine-9"></div>
      <div class="fine-ray fine-10"></div>
    </div>
    
    <!-- Golden dust motes -->
    <div class="dust-field">
      <div class="dust-mote mote-1"></div>
      <div class="dust-mote mote-2"></div>
      <div class="dust-mote mote-3"></div>
      <div class="dust-mote mote-4"></div>
      <div class="dust-mote mote-5"></div>
      <div class="dust-mote mote-6"></div>
      <div class="dust-mote mote-7"></div>
      <div class="dust-mote mote-8"></div>
      <div class="dust-mote mote-9"></div>
      <div class="dust-mote mote-10"></div>
      <div class="dust-mote mote-11"></div>
      <div class="dust-mote mote-12"></div>
    </div>
    
    <!-- Warm light wash -->
    <div class="warm-wash"></div>
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

/* Atmospheric haze - creates depth */
.atmospheric-haze {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 245, 220, 0.12) 0%,
    rgba(255, 235, 200, 0.06) 40%,
    transparent 70%
  );
  animation: haze-breathe 12s ease-in-out infinite;
}

/* Sun source position */
.sun-source {
  position: absolute;
  top: -8%;
  right: -8%;
  width: 200px;
  height: 200px;
}

.sun-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: radial-gradient(
    circle,
    rgba(255, 255, 240, 0.95) 0%,
    rgba(255, 230, 150, 0.7) 40%,
    rgba(255, 200, 100, 0.3) 70%,
    transparent 100%
  );
  border-radius: 50%;
  filter: blur(8px);
  animation: core-pulse 4s ease-in-out infinite;
}

.sun-corona {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 180px;
  height: 180px;
  background: radial-gradient(
    circle,
    rgba(255, 220, 150, 0.4) 0%,
    rgba(255, 200, 120, 0.15) 40%,
    transparent 70%
  );
  border-radius: 50%;
  filter: blur(20px);
  animation: corona-expand 6s ease-in-out infinite;
}

/* God ray layers */
.godray-layer {
  position: absolute;
  top: -15%;
  right: -15%;
  width: 150%;
  height: 150%;
  transform-origin: top right;
}

.primary-rays {
  animation: rays-sway 60s ease-in-out infinite alternate;
}

.secondary-rays {
  animation: rays-sway 80s ease-in-out infinite alternate-reverse;
  opacity: 0.6;
}

.tertiary-rays {
  animation: rays-sway 100s ease-in-out infinite alternate;
  opacity: 0.35;
}

/* Volumetric rays - main beams (12 rays) */
.volumetric-ray {
  position: absolute;
  top: 0;
  right: 0;
  height: 180%;
  background: linear-gradient(
    to bottom,
    rgba(255, 245, 200, 0.5) 0%,
    rgba(255, 235, 170, 0.35) 15%,
    rgba(255, 225, 150, 0.2) 35%,
    rgba(255, 215, 130, 0.08) 60%,
    transparent 100%
  );
  transform-origin: top right;
  filter: blur(12px);
  mix-blend-mode: screen;
  animation: beam-flicker 20s ease-in-out infinite;
}

.ray-1  { width: 60px;  transform: rotate(8deg);   animation-delay: 0s; }
.ray-2  { width: 100px; transform: rotate(16deg);  animation-delay: -0.7s; }
.ray-3  { width: 45px;  transform: rotate(24deg);  animation-delay: -1.4s; }
.ray-4  { width: 130px; transform: rotate(32deg);  animation-delay: -2.1s; }
.ray-5  { width: 70px;  transform: rotate(40deg);  animation-delay: -2.8s; }
.ray-6  { width: 150px; transform: rotate(48deg);  animation-delay: -3.5s; }
.ray-7  { width: 55px;  transform: rotate(56deg);  animation-delay: -4.2s; }
.ray-8  { width: 120px; transform: rotate(64deg);  animation-delay: -4.9s; }
.ray-9  { width: 80px;  transform: rotate(72deg);  animation-delay: -5.6s; }
.ray-10 { width: 140px; transform: rotate(80deg);  animation-delay: -6.3s; }
.ray-11 { width: 65px;  transform: rotate(88deg);  animation-delay: -7s; }
.ray-12 { width: 110px; transform: rotate(96deg);  animation-delay: -7.7s; }

/* Soft secondary rays (15 rays) */
.soft-ray {
  position: absolute;
  top: 0;
  right: 0;
  height: 200%;
  background: linear-gradient(
    to bottom,
    rgba(255, 250, 230, 0.25) 0%,
    rgba(255, 240, 200, 0.12) 30%,
    transparent 70%
  );
  transform-origin: top right;
  filter: blur(25px);
  mix-blend-mode: overlay;
  animation: soft-wave 25s ease-in-out infinite;
}

.soft-1  { width: 40px;  transform: rotate(5deg);   animation-delay: 0s; }
.soft-2  { width: 70px;  transform: rotate(12deg);  animation-delay: -0.8s; }
.soft-3  { width: 35px;  transform: rotate(20deg);  animation-delay: -1.6s; }
.soft-4  { width: 90px;  transform: rotate(28deg);  animation-delay: -2.4s; }
.soft-5  { width: 50px;  transform: rotate(36deg);  animation-delay: -3.2s; }
.soft-6  { width: 80px;  transform: rotate(44deg);  animation-delay: -4s; }
.soft-7  { width: 45px;  transform: rotate(52deg);  animation-delay: -4.8s; }
.soft-8  { width: 100px; transform: rotate(60deg);  animation-delay: -5.6s; }
.soft-9  { width: 55px;  transform: rotate(68deg);  animation-delay: -6.4s; }
.soft-10 { width: 75px;  transform: rotate(76deg);  animation-delay: -7.2s; }
.soft-11 { width: 60px;  transform: rotate(84deg);  animation-delay: -8s; }
.soft-12 { width: 85px;  transform: rotate(92deg);  animation-delay: -8.8s; }
.soft-13 { width: 40px;  transform: rotate(100deg); animation-delay: -9.6s; }
.soft-14 { width: 95px;  transform: rotate(108deg); animation-delay: -10.4s; }
.soft-15 { width: 50px;  transform: rotate(115deg); animation-delay: -11.2s; }

/* Fine tertiary rays (10 rays) - very subtle background fill */
.fine-ray {
  position: absolute;
  top: 0;
  right: 0;
  height: 220%;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 240, 0.15) 0%,
    rgba(255, 245, 220, 0.08) 25%,
    transparent 60%
  );
  transform-origin: top right;
  filter: blur(40px);
  mix-blend-mode: soft-light;
  animation: fine-shimmer 30s ease-in-out infinite;
}

.fine-1  { width: 200px; transform: rotate(10deg);  animation-delay: 0s; }
.fine-2  { width: 180px; transform: rotate(25deg);  animation-delay: -1.5s; }
.fine-3  { width: 220px; transform: rotate(38deg);  animation-delay: -3s; }
.fine-4  { width: 160px; transform: rotate(50deg);  animation-delay: -4.5s; }
.fine-5  { width: 240px; transform: rotate(62deg);  animation-delay: -6s; }
.fine-6  { width: 190px; transform: rotate(74deg);  animation-delay: -7.5s; }
.fine-7  { width: 210px; transform: rotate(86deg);  animation-delay: -9s; }
.fine-8  { width: 170px; transform: rotate(98deg);  animation-delay: -10.5s; }
.fine-9  { width: 230px; transform: rotate(110deg); animation-delay: -12s; }
.fine-10 { width: 185px; transform: rotate(120deg); animation-delay: -13.5s; }

/* Golden dust motes */
.dust-field {
  position: absolute;
  top: 0;
  right: 0;
  width: 60%;
  height: 100%;
}

.dust-mote {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(
    circle,
    rgba(255, 240, 180, 0.9) 0%,
    rgba(255, 220, 150, 0.5) 50%,
    transparent 100%
  );
  border-radius: 50%;
  animation: mote-drift 20s linear infinite;
}

.mote-1 { right: 10%; top: 5%; animation-duration: 18s; animation-delay: 0s; }
.mote-2 { right: 25%; top: 8%; animation-duration: 22s; animation-delay: -3s; width: 3px; height: 3px; }
.mote-3 { right: 15%; top: 12%; animation-duration: 16s; animation-delay: -6s; }
.mote-4 { right: 35%; top: 3%; animation-duration: 24s; animation-delay: -9s; width: 5px; height: 5px; }
.mote-5 { right: 8%; top: 18%; animation-duration: 19s; animation-delay: -2s; width: 3px; height: 3px; }
.mote-6 { right: 40%; top: 10%; animation-duration: 21s; animation-delay: -5s; }
.mote-7 { right: 20%; top: 2%; animation-duration: 17s; animation-delay: -8s; width: 4px; height: 4px; }
.mote-8 { right: 30%; top: 15%; animation-duration: 23s; animation-delay: -11s; width: 3px; height: 3px; }
.mote-9 { right: 5%; top: 22%; animation-duration: 20s; animation-delay: -4s; }
.mote-10 { right: 45%; top: 6%; animation-duration: 25s; animation-delay: -7s; width: 5px; height: 5px; }
.mote-11 { right: 18%; top: 25%; animation-duration: 15s; animation-delay: -10s; width: 3px; height: 3px; }
.mote-12 { right: 50%; top: 20%; animation-duration: 26s; animation-delay: -1s; }

/* Warm color wash overlay */
.warm-wash {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at top right,
    rgba(255, 200, 100, 0.08) 0%,
    transparent 50%
  );
  animation: wash-pulse 10s ease-in-out infinite;
}

/* ===== ANIMATIONS ===== */

@keyframes haze-breathe {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}

@keyframes core-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
  50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
}

@keyframes corona-expand {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.9; }
}

@keyframes rays-sway {
  0% { transform: rotate(-1deg); }
  100% { transform: rotate(1deg); }
}

@keyframes beam-flicker {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.65; }
}

@keyframes soft-wave {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.5; }
}

@keyframes fine-shimmer {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.4; }
}

@keyframes mote-drift {
  0% {
    transform: translateY(0) translateX(0) scale(0);
    opacity: 0;
  }
  5% {
    transform: translateY(5vh) translateX(5px) scale(1);
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  95% {
    transform: translateY(95vh) translateX(-20px) scale(0.6);
    opacity: 0.6;
  }
  100% {
    transform: translateY(100vh) translateX(-25px) scale(0);
    opacity: 0;
  }
}

@keyframes wash-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

/* Responsive */
@media (max-width: 768px) {
  .sun-source {
    width: 150px;
    height: 150px;
  }
  
  .volumetric-ray {
    filter: blur(10px);
  }
  
  .soft-ray {
    filter: blur(20px);
  }
  
  .fine-ray {
    filter: blur(30px);
  }
  
  .dust-field {
    width: 80%;
  }
}
</style>
