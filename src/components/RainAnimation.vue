<template>
  <canvas 
    v-if="isVisible" 
    ref="rainCanvas" 
    class="absolute inset-0 pointer-events-none z-5"
    :style="{ width: '100%', height: '100%' }"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

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
    const baseCount = area / 50000; // Base density

    switch (this.intensity) {
      case 'light': return Math.floor(baseCount * 0.3);
      case 'moderate': return Math.floor(baseCount * 0.6);
      case 'heavy': return Math.floor(baseCount * 1.0);
      case 'intense': return Math.floor(baseCount * 1.5);
      default: return 0;
    }
  }

  private createDrop(): RainDrop {
    const canvas = this.canvas;
    let speed, length, width, opacity;

    switch (this.intensity) {
      case 'light':
        speed = 2 + Math.random() * 3;
        length = 10 + Math.random() * 10;
        width = 0.5 + Math.random() * 0.5;
        opacity = 0.3 + Math.random() * 0.3;
        break;
      case 'moderate':
        speed = 4 + Math.random() * 4;
        length = 15 + Math.random() * 15;
        width = 0.8 + Math.random() * 0.7;
        opacity = 0.4 + Math.random() * 0.4;
        break;
      case 'heavy':
        speed = 6 + Math.random() * 6;
        length = 20 + Math.random() * 20;
        width = 1 + Math.random() * 1;
        opacity = 0.5 + Math.random() * 0.4;
        break;
      case 'intense':
        speed = 8 + Math.random() * 8;
        length = 25 + Math.random() * 25;
        width = 1.2 + Math.random() * 1.3;
        opacity = 0.6 + Math.random() * 0.4;
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
    this.ctx.strokeStyle = `rgba(200, 220, 255, ${drop.opacity})`;
    this.ctx.lineWidth = drop.width;
    this.ctx.lineCap = 'round';

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
  if (rainCanvas.value) {
    rainSystem = new RainParticleSystem(rainCanvas.value);
    updateRainSystem();
  }
}

// Update rain system intensity
function updateRainSystem() {
  if (rainSystem) {
    const intensity = props.isVisible ? props.intensity : 'none';
    rainSystem.updateIntensity(intensity);
  }
}

// Lifecycle hooks
onMounted(() => {
  setTimeout(() => {
    initializeRainSystem();
  }, 100);
});

onUnmounted(() => {
  if (rainSystem) {
    rainSystem.destroy();
    rainSystem = null;
  }
});

// Watch for prop changes
watch(() => props.isVisible, (newValue) => {
  updateRainSystem();
});

watch(() => props.intensity, (newValue) => {
  updateRainSystem();
});
</script>

<style scoped>
/* Rain animation canvas styles */
canvas {
  z-index: 5;
}
</style>
