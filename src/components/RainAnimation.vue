<template>
  <div v-if="isVisible" class="rain-container" ref="rainContainer"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

type Intensity = 'light' | 'moderate' | 'heavy' | 'torrential';

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  intensity: {
    type: String as () => Intensity,
    default: 'light',
  },
});

const rainContainer = ref<HTMLElement | null>(null);
let animationFrameId: number;
let raindrops: { el: HTMLElement; x: number; y: number; z: number; vy: number }[] = [];

const intensityMap: { [key in Intensity]: { count: number; speedFactor: number } } = {
  light: { count: 50, speedFactor: 1 },
  moderate: { count: 150, speedFactor: 1.5 },
  heavy: { count: 300, speedFactor: 2 },
  torrential: { count: 500, speedFactor: 2.5 },
};

const createRaindrop = () => {
  if (!rainContainer.value) return;

  const drop = document.createElement('div');
  drop.className = 'raindrop';
  rainContainer.value.appendChild(drop);

  const x = Math.random() * window.innerWidth;
  const y = Math.random() * -window.innerHeight;
  const z = Math.random() * 3 + 1; // Depth
  const vy = (z * (intensityMap[props.intensity]?.speedFactor || 1)) + 5;

  drop.style.left = `${x}px`;
  drop.style.transform = `translateY(${y}px) scale(${z * 0.5})`;
  drop.style.opacity = `${Math.random() * 0.5 + 0.3}`;
  
  return { el: drop, x, y, z, vy };
};

const updateRaindrops = () => {
  raindrops.forEach((drop) => {
    drop.y += drop.vy;
    drop.el.style.transform = `translateY(${drop.y}px) scale(${drop.z * 0.5})`;

    if (drop.y > window.innerHeight) {
      // Reset drop to the top
      drop.y = Math.random() * -200 - 100;
      drop.x = Math.random() * window.innerWidth;
      drop.el.style.left = `${drop.x}px`;
    }
  });
};

const animate = () => {
  updateRaindrops();
  animationFrameId = requestAnimationFrame(animate);
};

const setupRain = () => {
  if (!rainContainer.value) return;

  // Clear existing raindrops
  while (rainContainer.value.firstChild) {
    rainContainer.value.removeChild(rainContainer.value.firstChild as Node);
  }
  raindrops = [];

  if (!props.isVisible) {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    return;
  }

  const { count } = intensityMap[props.intensity] || intensityMap.light;
  for (let i = 0; i < count; i++) {
    const raindrop = createRaindrop();
    if (raindrop) {
      // Initialize position randomly within the screen height to start
      raindrop.y = Math.random() * window.innerHeight;
      raindrops.push(raindrop);
    }
  }
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  animate();
};

watch(() => [props.intensity, props.isVisible], () => {
  nextTick(() => {
    setupRain();
  });
}, { immediate: true });

onMounted(() => {
  window.addEventListener('resize', setupRain);
  setupRain();
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  window.removeEventListener('resize', setupRain);
  if (rainContainer.value) {
    // Clean up DOM elements
    while (rainContainer.value.firstChild) {
      rainContainer.value.removeChild(rainContainer.value.firstChild as Node);
    }
  }
});
</script>

<style>
.rain-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  overflow: hidden;
}

.raindrop {
  position: absolute;
  width: 2px;
  height: 20px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(174, 194, 224, 0.4));
  border-radius: 1px;
}
</style>
