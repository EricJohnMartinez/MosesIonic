<template>
  <div v-if="isVisible" class="fixed inset-0 pointer-events-none z-0 cloud-container">
    <!-- Extra Large clouds - Layer 1 -->
    <img 
      src="/images/Clouds/cloud1.png" 
      alt="Cloud"
      class="cloud-animation-xl absolute top-[5%] left-0 w-80 sm:w-96 md:w-[32rem] lg:w-[40rem] xl:w-[48rem] opacity-35 pointer-events-none cloud-fade"
      style="transform: translateX(-100%)" 
    />

    <img 
      src="/images/Clouds/Cloud2.png" 
      alt="Cloud"
      class="cloud-animation-xl-slow absolute top-[15%] left-0 w-72 sm:w-88 md:w-[28rem] lg:w-[36rem] xl:w-[44rem] opacity-30 pointer-events-none cloud-fade"
      style="transform: translateX(-120%); animation-delay: 10s;" 
    />

    <!-- Large clouds - Layer 2 -->
    <img 
      src="/images/Clouds/Cloud3.png" 
      alt="Cloud"
      class="cloud-animation-large absolute top-[25%] left-0 w-64 sm:w-80 md:w-96 lg:w-[32rem] xl:w-[40rem] opacity-28 pointer-events-none cloud-fade"
      style="transform: translateX(-110%); animation-delay: 20s;" 
    />

    <img 
      src="/images/Clouds/cloud1.png" 
      alt="Cloud"
      class="cloud-animation-large-reverse absolute top-[8%] right-0 w-68 sm:w-84 md:w-[30rem] lg:w-[38rem] xl:w-[46rem] opacity-25 pointer-events-none cloud-fade"
      style="transform: translateX(100%); animation-delay: 5s;" 
    />

    <!-- Medium clouds - Layer 3 -->
    <img 
      src="/images/Clouds/Cloud2.png" 
      alt="Cloud"
      class="cloud-animation-medium absolute top-[35%] left-0 w-56 sm:w-72 md:w-88 lg:w-[28rem] xl:w-[36rem] opacity-22 pointer-events-none cloud-fade"
      style="transform: translateX(-130%); animation-delay: 30s;" 
    />

    <img 
      src="/images/Clouds/Cloud3.png" 
      alt="Cloud"
      class="cloud-animation-medium-reverse absolute top-[12%] right-0 w-60 sm:w-76 md:w-92 lg:w-[30rem] xl:w-[38rem] opacity-20 pointer-events-none cloud-fade"
      style="transform: translateX(110%); animation-delay: 15s;" 
    />

    <!-- Small accent clouds - Layer 4 -->
    <img 
      src="/images/Clouds/cloud1.png" 
      alt="Cloud"
      class="cloud-animation-small absolute top-[45%] left-0 w-48 sm:w-64 md:w-80 lg:w-96 xl:w-[32rem] opacity-18 pointer-events-none cloud-fade"
      style="transform: translateX(-140%); animation-delay: 40s;" 
    />

    <img 
      src="/images/Clouds/Cloud2.png" 
      alt="Cloud"
      class="cloud-animation-small-reverse absolute top-[20%] right-0 w-44 sm:w-60 md:w-76 lg:w-92 xl:w-[30rem] opacity-16 pointer-events-none cloud-fade"
      style="transform: translateX(120%); animation-delay: 25s;" 
    />

    <!-- Extra small clouds - Layer 5 -->
    <img 
      src="/images/Clouds/Cloud3.png" 
      alt="Cloud"
      class="cloud-animation-drift absolute top-[50%] left-0 w-40 sm:w-56 md:w-72 lg:w-88 xl:w-[28rem] opacity-14 pointer-events-none cloud-fade"
      style="transform: translateX(-150%); animation-delay: 50s;" 
    />

    <img 
      src="/images/Clouds/cloud1.png" 
      alt="Cloud"
      class="cloud-animation-drift-reverse absolute top-[3%] right-0 w-36 sm:w-52 md:w-68 lg:w-84 xl:w-[26rem] opacity-12 pointer-events-none cloud-fade"
      style="transform: translateX(130%); animation-delay: 35s;" 
    />

    <!-- Additional frequent clouds for density -->
    <img 
      src="/images/Clouds/Cloud2.png" 
      alt="Cloud"
      class="cloud-animation-frequent1 absolute top-[30%] left-0 w-52 sm:w-68 md:w-84 lg:w-[26rem] xl:w-[34rem] opacity-15 pointer-events-none cloud-fade"
      style="transform: translateX(-160%); animation-delay: 60s;" 
    />

    <img 
      src="/images/Clouds/Cloud3.png" 
      alt="Cloud"
      class="cloud-animation-frequent2 absolute top-[40%] right-0 w-48 sm:w-64 md:w-80 lg:w-96 xl:w-[32rem] opacity-17 pointer-events-none cloud-fade"
      style="transform: translateX(140%); animation-delay: 45s;" 
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  isVisible?: boolean;
}

withDefaults(defineProps<Props>(), {
  isVisible: true
});
</script>

<style scoped>
/* Fade mask for cloud edges (left/right and top/bottom) */
.cloud-fade {
  mask-image: 
    linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%),
    linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
  -webkit-mask-image: 
    linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%),
    linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
  mask-composite: intersect;
  -webkit-mask-composite: source-in;
}
.cloud-container {
  overflow: hidden;
}

/* Base Cloud Animation */
@keyframes cloudFadeIn {
  0% {
    transform: translateX(0%);
    opacity: 0.3;
  }

  40% {
    opacity: 0.3;
  }

  100% {
    transform: translateX(calc(100vw + 100%));
    opacity: 0;
  }
}

.cloud-animation {
  animation: cloudFadeIn 80s linear infinite;
  animation-delay: 5s;
}

.cloud-animation-slow {
  animation: cloudFadeInSlow 90s linear infinite;
  animation-delay: 15s;
}

/* Extra Large Clouds */
.cloud-animation-xl {
  animation: cloudFadeInXL 100s linear infinite;
  animation-delay: 0s;
}

.cloud-animation-xl-slow {
  animation: cloudFadeInXLSlow 110s linear infinite;
  animation-delay: 10s;
}

/* Large Clouds */
.cloud-animation-large {
  animation: cloudFadeInLarge 95s linear infinite;
  animation-delay: 20s;
}

.cloud-animation-large-reverse {
  animation: cloudFadeInLargeReverse 105s linear infinite;
  animation-delay: 5s;
}

.cloud-animation-medium {
  animation: cloudFadeInMedium 120s linear infinite;
  animation-delay: 30s;
}

.cloud-animation-medium-reverse {
  animation: cloudFadeInMediumReverse 115s linear infinite;
  animation-delay: 15s;
}

.cloud-animation-small {
  animation: cloudFadeInSmall 130s linear infinite;
  animation-delay: 40s;
}

.cloud-animation-small-reverse {
  animation: cloudFadeInSmallReverse 125s linear infinite;
  animation-delay: 25s;
}

.cloud-animation-drift {
  animation: cloudFadeInDrift 140s linear infinite;
  animation-delay: 50s;
}

.cloud-animation-drift-reverse {
  animation: cloudFadeInDriftReverse 135s linear infinite;
  animation-delay: 35s;
}

/* Frequent clouds for density */
.cloud-animation-frequent1 {
  animation: cloudFadeInFrequent1 150s linear infinite;
  animation-delay: 60s;
}

.cloud-animation-frequent2 {
  animation: cloudFadeInFrequent2 145s linear infinite;
  animation-delay: 45s;
}

/* Additional cloud variations for more natural movement */
@keyframes cloudFadeInSlow {
  0% {
    transform: translateX(20%);
    opacity: 0.2;
  }

  40% {
    opacity: 0.2;
  }

  100% {
    transform: translateX(calc(100vw + 120%));
    opacity: 0;
  }
}

/* Extra Large Cloud Animations */
@keyframes cloudFadeInXL {
  0% {
    transform: translateX(5%);
    opacity: 0.35;
  }

  50% {
    opacity: 0.35;
  }

  100% {
    transform: translateX(calc(100vw + 100%));
    opacity: 0;
  }
}

@keyframes cloudFadeInXLSlow {
  0% {
    transform: translateX(15%);
    opacity: 0.30;
  }

  45% {
    opacity: 0.30;
  }

  100% {
    transform: translateX(calc(100vw + 120%));
    opacity: 0;
  }
}

/* Large Cloud Animations */
@keyframes cloudFadeInLarge {
  0% {
    transform: translateX(25%);
    opacity: 0.28;
  }

  48% {
    opacity: 0.28;
  }

  100% {
    transform: translateX(calc(100vw + 110%));
    opacity: 0;
  }
}

@keyframes cloudFadeInLargeReverse {
  0% {
    transform: translateX(80%);
    opacity: 0.25;
  }

  52% {
    opacity: 0.25;
  }

  100% {
    transform: translateX(calc(-100vw - 100%));
    opacity: 0;
  }
}

/* Medium cloud animation */
@keyframes cloudFadeInMedium {
  0% {
    transform: translateX(35%);
    opacity: 0.22;
  }

  45% {
    opacity: 0.22;
  }

  100% {
    transform: translateX(calc(100vw + 130%));
    opacity: 0;
  }
}

@keyframes cloudFadeInMediumReverse {
  0% {
    transform: translateX(70%);
    opacity: 0.20;
  }

  50% {
    opacity: 0.20;
  }

  100% {
    transform: translateX(calc(-100vw - 110%));
    opacity: 0;
  }
}

/* Small cloud animation */
@keyframes cloudFadeInSmall {
  0% {
    transform: translateX(45%);
    opacity: 0.18;
  }

  35% {
    opacity: 0.18;
  }

  100% {
    transform: translateX(calc(100vw + 140%));
    opacity: 0;
  }
}

@keyframes cloudFadeInSmallReverse {
  0% {
    transform: translateX(60%);
    opacity: 0.16;
  }

  40% {
    opacity: 0.16;
  }

  100% {
    transform: translateX(calc(-100vw - 120%));
    opacity: 0;
  }
}

/* Drift cloud animation */
@keyframes cloudFadeInDrift {
  0% {
    transform: translateX(50%);
    opacity: 0.14;
  }

  30% {
    opacity: 0.14;
  }

  100% {
    transform: translateX(calc(100vw + 150%));
    opacity: 0;
  }
}

@keyframes cloudFadeInDriftReverse {
  0% {
    transform: translateX(65%);
    opacity: 0.12;
  }

  35% {
    opacity: 0.12;
  }

  100% {
    transform: translateX(calc(-100vw - 130%));
    opacity: 0;
  }
}

/* Frequent cloud animations for density */
@keyframes cloudFadeInFrequent1 {
  0% {
    transform: translateX(30%);
    opacity: 0.15;
  }

  42% {
    opacity: 0.15;
  }

  100% {
    transform: translateX(calc(100vw + 160%));
    opacity: 0;
  }
}

@keyframes cloudFadeInFrequent2 {
  0% {
    transform: translateX(75%);
    opacity: 0.17;
  }

  46% {
    opacity: 0.17;
  }

  100% {
    transform: translateX(calc(-100vw - 140%));
    opacity: 0;
  }
}
</style>
