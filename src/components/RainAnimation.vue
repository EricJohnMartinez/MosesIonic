<template>
  <canvas 
    v-if="isVisible" 
    ref="rainCanvas" 
    class="absolute inset-0 pointer-events-none z-5"
    :style="{ width: '100%', height: '100%' }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

// Props
interface Props {
  isVisible: boolean;
  intensity?: string;
}

const props = withDefaults(defineProps<Props>(), {
  intensity: 'moderate'
});

// Refs
const rainCanvas = ref<HTMLCanvasElement | null>(null);

// Rain Particle System Interface
interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  width: number;
}

class RainParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private drops: RainDrop[] = [];
  private animationId: number | null = null;
  private intensity: string = 'none';
  private windEffect: number = 0;
  private logged: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    this.setupEventListeners();
  }

  private resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  private setupEventListeners() {
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private getDropCount(): number {
    const area = this.canvas.width * this.canvas.height;
    const baseCount = area / 15000; // Much higher density for more droplets

    switch (this.intensity) {
      case 'light': return Math.floor(baseCount * 0.8);
      case 'moderate': return Math.floor(baseCount * 1.5);
      case 'heavy': return Math.floor(baseCount * 2.5);
      case 'intense': return Math.floor(baseCount * 4.0);
      default: return 0;
    }
  }

  private createDrop(): RainDrop {
    const canvas = this.canvas;
    let speed, length, width, opacity;

    switch (this.intensity) {
      case 'light':
        speed = 2 + Math.random() * 3;
        length = 12 + Math.random() * 12;
        width = 1 + Math.random() * 1; // Thicker drops
        opacity = 0.5 + Math.random() * 0.3; // More opaque
        break;
      case 'moderate':
        speed = 4 + Math.random() * 4;
        length = 18 + Math.random() * 18;
        width = 1.5 + Math.random() * 1; // Thicker
        opacity = 0.6 + Math.random() * 0.3; // More opaque
        break;
      case 'heavy':
        speed = 6 + Math.random() * 6;
        length = 25 + Math.random() * 25;
        width = 2 + Math.random() * 1.5; // Thicker
        opacity = 0.7 + Math.random() * 0.3; // More opaque
        break;
      case 'intense':
        speed = 8 + Math.random() * 8;
        length = 30 + Math.random() * 30;
        width = 2.5 + Math.random() * 2; // Thicker
        opacity = 0.8 + Math.random() * 0.2; // More opaque
        break;
      default:
        speed = 0; length = 0; width = 0; opacity = 0;
    }

    return {
      x: Math.random() * (canvas.width + 100) - 50,
      y: -length,
      length,
      speed,
      opacity,
      width
    };
  }

  private updateDrop(drop: RainDrop) {
    drop.y += drop.speed;
    drop.x += this.windEffect;

    // Reset drop when it goes off screen
    if (drop.y > this.canvas.height + drop.length) {
      Object.assign(drop, this.createDrop());
    }

    // Handle horizontal wrapping for wind effect
    if (drop.x > this.canvas.width + 50) {
      drop.x = -50;
    } else if (drop.x < -50) {
      drop.x = this.canvas.width + 50;
    }
  }

  private drawDrop(drop: RainDrop) {
    this.ctx.save();
    this.ctx.globalAlpha = drop.opacity;
    this.ctx.strokeStyle = `rgba(220, 240, 255, ${drop.opacity})`; // Brighter color for clarity
    this.ctx.lineWidth = drop.width;
    this.ctx.lineCap = 'round';

    // Add glow effect for clarity
    this.ctx.shadowColor = 'rgba(200, 220, 255, 0.8)';
    this.ctx.shadowBlur = 3;

    this.ctx.beginPath();
    this.ctx.moveTo(drop.x, drop.y);
    this.ctx.lineTo(drop.x - this.windEffect * 0.5, drop.y + drop.length);
    this.ctx.stroke();
    this.ctx.restore();
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update wind effect based on intensity
    this.windEffect = this.intensity === 'intense' ? Math.sin(Date.now() * 0.001) * 2 : 0;

    // Update and draw drops
    this.drops.forEach(drop => {
      this.updateDrop(drop);
      this.drawDrop(drop);
    });

    // Debug: Log once per second
    if (Math.floor(Date.now() / 1000) % 5 === 0 && !this.logged) {
      console.log(`RainAnimation System: Animating ${this.drops.length} drops`);
      this.logged = true;
    } else if (Math.floor(Date.now() / 1000) % 5 !== 0) {
      this.logged = false;
    }

    this.animationId = requestAnimationFrame(this.animate);
  };

  public start(intensity: string) {
    this.intensity = intensity;

    // Create drops based on intensity
    const dropCount = this.getDropCount();
    this.drops = [];
    for (let i = 0; i < dropCount; i++) {
      this.drops.push(this.createDrop());
    }

    console.log(`RainAnimation System: Starting with ${dropCount} drops for intensity: ${intensity}`);

    // Start animation
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.animate();
  }

  public stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drops = [];
  }

  public updateIntensity(newIntensity: string) {
    if (newIntensity !== this.intensity) {
      this.intensity = newIntensity;
      if (newIntensity === 'none') {
        this.stop();
      } else {
        this.start(newIntensity);
      }
    }
  }

  public destroy() {
    this.stop();
    window.removeEventListener('resize', () => this.resizeCanvas());
  }
}

// Rain system instance
let rainSystem: RainParticleSystem | null = null;

// Initialize rain system
function initializeRainSystem() {
  nextTick(() => {
    if (rainCanvas.value && !rainSystem) {
      console.log('RainAnimation Component: Initializing rain system');
      rainSystem = new RainParticleSystem(rainCanvas.value);
      updateRainSystem();
    } else if (!rainCanvas.value) {
      console.log('RainAnimation Component: Canvas not available yet, retrying...');
      setTimeout(() => initializeRainSystem(), 100);
    }
  });
}

// Update rain system intensity
function updateRainSystem() {
  if (rainSystem) {
    const intensity = props.isVisible ? props.intensity : 'none';
    console.log('RainAnimation Component: isVisible =', props.isVisible, 'intensity =', props.intensity, 'final intensity =', intensity);
    rainSystem.updateIntensity(intensity);
  } else {
    console.log('RainAnimation Component: rainSystem not initialized, trying to initialize...');
    initializeRainSystem();
  }
}

// Lifecycle hooks
onMounted(() => {
  console.log('RainAnimation Component: Component mounted');
  nextTick(() => {
    setTimeout(() => {
      initializeRainSystem();
    }, 100);
  });
});

onUnmounted(() => {
  console.log('RainAnimation Component: Component unmounted');
  if (rainSystem) {
    rainSystem.destroy();
    rainSystem = null;
  }
});

// Watch for prop changes
watch(() => props.isVisible, (newValue, oldValue) => {
  console.log('RainAnimation Component: isVisible changed from', oldValue, 'to', newValue);
  if (newValue && !rainSystem) {
    // If becoming visible but no rain system, try to initialize
    setTimeout(() => {
      initializeRainSystem();
    }, 200);
  }
  updateRainSystem();
}, { immediate: true });

watch(() => props.intensity, (newValue) => {
  console.log('RainAnimation Component: intensity changed to', newValue);
  updateRainSystem();
});

// Watch for canvas availability
watch(rainCanvas, (newCanvas) => {
  if (newCanvas && !rainSystem) {
    console.log('RainAnimation Component: Canvas became available');
    initializeRainSystem();
  }
});
</script>

<style scoped>
/* Rain animation canvas styles */
canvas {
  z-index: 5;
}
</style>
