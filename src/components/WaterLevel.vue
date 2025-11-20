<template>
  <div class="p-0">
    <!-- Header with Controls -->
    <div class="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div class="bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex-1 min-w-[250px] shadow-2xl shadow-black/20">
        <div class="flex items-center gap-3">
          <div class="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3 rounded-xl border border-blue-500/30">
            <span class="text-3xl">💧</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">Water Level Monitoring</h2>
            <p class="text-sm text-gray-400">{{ visibleWaterStations.length }}/{{ waterLevelData.length }} stations</p>
          </div>
        </div>
      </div>

      <!-- Station Count Toggle Button -->
      <button 
        @click="toggleStationSettings"
        type="button"
        class="bg-slate-800/60 backdrop-blur-xl border border-white/10 hover:border-blue-500/30 rounded-2xl p-5 transition-all duration-300 shadow-2xl shadow-black/20 hover:shadow-blue-500/20 text-white font-semibold flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
        </svg>
        <span>Manage Stations</span>
      </button>
    </div>

    <!-- Station Settings Panel -->
    <transition name="slide-down">
      <div v-if="showStationSettings" class="mb-6 bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/20 relative z-30">
        <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          </svg>
          Select Water Stations to Display
        </h3>

        <!-- Searchable Dropdown -->
        <div class="relative mb-4" ref="dropdownContainer">
          <div class="relative">
            <input
              v-model="searchQuery"
              @focus="openDropdown"
              @input="openDropdown"
              @click="openDropdown"
              type="text"
              placeholder="Search or select stations..."
              class="w-full px-4 py-3 bg-slate-900/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              @click.stop="toggleDropdown"
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <svg class="w-5 h-5 transition-transform duration-200" :class="{ 'rotate-180': isDropdownOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          </div>

          <!-- Dropdown List -->
          <transition name="dropdown">
            <div v-if="isDropdownOpen" class="absolute z-[100] w-full mt-2 bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
              <div v-if="filteredStations.length === 0" class="p-4 text-center text-gray-400">
                No stations found
              </div>
              <div v-else class="py-2">
                <div
                  v-for="station in filteredStations"
                  :key="station.id"
                  @click.stop="toggleStationVisibilityFromDropdown(station.id)"
                  class="flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 cursor-pointer transition-all"
                >
                  <div 
                    class="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    :class="visibleWaterStationIds.includes(station.id) 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-500 bg-slate-900/50'"
                  >
                    <svg v-if="visibleWaterStationIds.includes(station.id)" class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-white">{{ station.name }}</div>
                    <div class="text-xs text-gray-400">{{ station.location }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-bold text-blue-400">{{ station.level.toFixed(2) }}m</div>
                    <div class="text-xs text-gray-500">Current</div>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- Selected Stations Summary -->
        <div v-if="visibleWaterStationIds.length > 0" class="mb-4">
          <div class="text-xs text-gray-400 mb-2">Selected Stations ({{ visibleWaterStationIds.length }})</div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="stationId in visibleWaterStationIds"
              :key="stationId"
              class="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-white"
            >
              <span>{{ getStationById(stationId)?.name }}</span>
              <button
                @click="toggleWaterStationVisibility(stationId)"
                type="button"
                :disabled="visibleWaterStationIds.length === 1"
                class="hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <button 
          @click="toggleStationSettings"
          type="button"
          class="mt-4 w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all">
          Done
        </button>
      </div>
    </transition>

    <!-- Water Level Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div 
        v-for="station in visibleWaterStations" 
        :key="station.id"
        class="relative bg-slate-800/50 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30 hover:border-white/20 overflow-hidden flex flex-col"
      >
        <!-- Status indicator bar at top -->
        <div 
          class="absolute top-0 left-0 right-0 h-1 opacity-50"
          :class="{
            'bg-gradient-to-r from-transparent via-green-500 to-transparent': station.level < station.criticalLevel * 0.8,
            'bg-gradient-to-r from-transparent via-yellow-500 to-transparent': station.level >= station.criticalLevel * 0.8 && station.level < station.criticalLevel,
            'bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse': station.level >= station.criticalLevel
          }"
        ></div>

        <!-- Card Header -->
        <div class="flex justify-between items-start mb-5 gap-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-base">📍</span>
              <h3 class="text-lg font-bold text-white leading-tight">{{ station.name }}</h3>
            </div>
            <p class="text-[0.813rem] text-slate-400 mt-1">{{ station.location }}</p>
          </div>
          <div 
            class="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap backdrop-blur-md border"
            :class="{
              'bg-green-500/15 text-green-400 border-green-500/30': station.level < station.criticalLevel * 0.8,
              'bg-yellow-500/15 text-yellow-300 border-yellow-500/30': station.level >= station.criticalLevel * 0.8 && station.level < station.criticalLevel,
              'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse': station.level >= station.criticalLevel
            }"
          >
            {{ getStatusText(station.level, station.criticalLevel) }}
          </div>
        </div>

        <!-- Gauge and Data Section -->
        <div class="flex gap-6 mb-4 flex-1 items-stretch">
          <!-- Water Gauge -->
          <div class="flex-none w-[100px]">
            <div class="relative h-full min-h-[180px] bg-slate-900/60 border-2 border-blue-500/30 rounded-xl overflow-hidden flex flex-col">
              <!-- Critical Level Line -->
              <div 
                class="absolute left-0 right-0 h-0.5 bg-red-500 z-30 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                :style="{ bottom: (station.criticalLevel / station.maxLevel * 100) + '%' }"
              >
                <div class="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 border-solid border-y-[5px] border-l-[8px] border-y-transparent border-l-red-500"></div>
                <div class="absolute right-1 -top-3.5 text-[0.625rem] font-bold text-red-500 bg-slate-900/90 px-1.5 py-0.5 rounded whitespace-nowrap uppercase tracking-wide">
                  Critical
                </div>
              </div>
              
              <!-- Water Fill Animation -->
              <div 
                class="absolute bottom-0 left-0 right-0 z-20 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                :style="{ height: (station.level / station.maxLevel * 100) + '%' }"
                :class="{
                  'bg-gradient-to-t from-cyan-500 to-blue-500': station.level < station.criticalLevel * 0.8,
                  'bg-gradient-to-t from-yellow-500 to-yellow-400': station.level >= station.criticalLevel * 0.8 && station.level < station.criticalLevel,
                  'bg-gradient-to-t from-red-600 to-red-500': station.level >= station.criticalLevel
                }"
              >
                <!-- Waves -->
                <div class="absolute -top-[15px] -left-1/2 w-[200%] h-[15px] bg-white/25 rounded-[40%] animate-[wave_3s_linear_infinite]"></div>
                <div class="absolute -top-[12px] -left-1/2 w-[200%] h-[15px] bg-white/25 rounded-[40%] opacity-70 animate-[wave_4s_linear_infinite_reverse]"></div>
                <div class="absolute -top-[10px] -left-1/2 w-[200%] h-[15px] bg-white/25 rounded-[40%] opacity-50 animate-[wave_5s_linear_infinite]"></div>
                
                <!-- Bubbles -->
                <div class="bubble bubble-1"></div>
                <div class="bubble bubble-2"></div>
                <div class="bubble bubble-3"></div>
                <div class="bubble bubble-4"></div>
                <div class="bubble bubble-5"></div>
                <div class="bubble bubble-6"></div>
                
                <!-- Water shimmer -->
                <div class="water-shimmer"></div>
              </div>

              <!-- Scale Markers -->
              <div class="absolute inset-0 flex flex-col-reverse justify-between pointer-events-none z-10">
                <div v-for="i in 6" :key="i" class="relative h-px bg-slate-400/20">
                  <span class="absolute right-1 -top-2 text-[0.625rem] text-slate-500 bg-slate-900/80 px-0.5 rounded-sm">
                    {{ ((station.maxLevel / 5) * (i - 1)).toFixed(1) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Section -->
          <div class="flex-1 flex flex-col justify-between">
            <!-- Current Reading -->
            <div class="text-center mb-4">
              <div class="text-[2.5rem] font-extrabold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent leading-none tracking-tight">
                {{ station.level.toFixed(2) }}
              </div>
              <div class="text-sm text-slate-400 mt-1 font-medium">meters</div>
            </div>

            <!-- Data Grid -->
            <div class="flex flex-col gap-3 mb-4">
              <div class="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-white/5">
                <div class="text-xl leading-none">📏</div>
                <div class="flex-1">
                  <div class="text-xs text-slate-400 mb-0.5">Max Level</div>
                  <div class="text-[0.938rem] font-bold text-white">{{ station.maxLevel.toFixed(1) }}m</div>
                </div>
              </div>

              <div class="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-white/5">
                <div 
                  class="text-xl leading-none"
                  :class="station.trend > 0 ? 'text-red-400' : 'text-green-400'"
                >
                  {{ station.trend > 0 ? '📈' : '📉' }}
                </div>
                <div class="flex-1">
                  <div class="text-xs text-slate-400 mb-0.5">Trend</div>
                  <div 
                    class="text-[0.938rem] font-bold"
                    :class="station.trend > 0 ? 'text-red-400' : 'text-green-400'"
                  >
                    {{ station.trend > 0 ? '+' : '' }}{{ station.trend.toFixed(2) }}m
                  </div>
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="mt-auto">
              <div class="flex justify-between items-center text-xs text-slate-400 mb-2">
                <span>Capacity</span>
                <span class="font-bold text-white">{{ ((station.level / station.maxLevel) * 100).toFixed(0) }}%</span>
              </div>
              <div class="h-2 bg-slate-900/60 rounded border border-white/5 overflow-hidden">
                <div 
                  class="h-full transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] rounded"
                  :style="{ width: ((station.level / station.maxLevel) * 100) + '%' }"
                  :class="{
                    'bg-gradient-to-r from-cyan-500 to-blue-500': station.level < station.criticalLevel * 0.8,
                    'bg-gradient-to-r from-yellow-500 to-yellow-400': station.level >= station.criticalLevel * 0.8 && station.level < station.criticalLevel,
                    'bg-gradient-to-r from-red-600 to-red-500': station.level >= station.criticalLevel
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="mt-4 pt-4 border-t border-white/5">
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{{ station.lastUpdated }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Preferences } from '@capacitor/preferences';

interface WaterLevelStation {
  id: number;
  name: string;
  location: string;
  level: number;
  maxLevel: number;
  criticalLevel: number;
  trend: number;
  lastUpdated: string;
}

// Mock data for 4 water level stations
const waterLevelData = ref<WaterLevelStation[]>([
  {
    id: 1,
    name: 'Maasin River',
    location: 'Maasin City, Southern Leyte',
    level: 3.8,
    maxLevel: 5.0,
    criticalLevel: 4.2,
    trend: 0.15,
    lastUpdated: '2 mins ago'
  },
  {
    id: 2,
    name: 'Sogod Bay',
    location: 'Sogod, Southern Leyte',
    level: 2.1,
    maxLevel: 5.0,
    criticalLevel: 4.0,
    trend: -0.05,
    lastUpdated: '5 mins ago'
  },
  {
    id: 3,
    name: 'Liloan Creek',
    location: 'Liloan, Southern Leyte',
    level: 4.5,
    maxLevel: 5.0,
    criticalLevel: 4.3,
    trend: 0.25,
    lastUpdated: '1 min ago'
  },
  {
    id: 4,
    name: 'Padre Burgos',
    location: 'Padre Burgos, Southern Leyte',
    level: 1.8,
    maxLevel: 5.0,
    criticalLevel: 3.8,
    trend: -0.10,
    lastUpdated: '3 mins ago'
  }
]);

// Visible water stations state - default to only first station
const visibleWaterStationIds = ref<number[]>([1]);
const showStationSettings = ref(false);

// Searchable dropdown state
const searchQuery = ref('');
const isDropdownOpen = ref(false);
const dropdownContainer = ref<HTMLElement | null>(null);

// Computed filtered stations based on search
const filteredStations = computed(() => {
  if (!searchQuery.value.trim()) {
    return waterLevelData.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return waterLevelData.value.filter(station => 
    station.name.toLowerCase().includes(query) ||
    station.location.toLowerCase().includes(query)
  );
});

// Get station by ID
function getStationById(id: number) {
  return waterLevelData.value.find(station => station.id === id);
}

// Open dropdown
function openDropdown() {
  isDropdownOpen.value = true;
}

// Toggle dropdown
function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

// Close dropdown
function closeDropdown() {
  isDropdownOpen.value = false;
}

// Handle click outside to close dropdown
function handleClickOutside(event: MouseEvent) {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target as Node)) {
    closeDropdown();
  }
}

// Toggle station visibility from dropdown (don't close dropdown)
function toggleStationVisibilityFromDropdown(stationId: number) {
  const index = visibleWaterStationIds.value.indexOf(stationId);
  if (index > -1) {
    // Remove station (but keep at least one visible)
    if (visibleWaterStationIds.value.length > 1) {
      visibleWaterStationIds.value.splice(index, 1);
    }
  } else {
    // Add station
    visibleWaterStationIds.value.push(stationId);
  }
  saveVisibleWaterStations();
}

// Load visible water stations from storage on mount
async function loadVisibleWaterStations() {
  try {
    const { value } = await Preferences.get({ key: 'visibleWaterStations' });
    if (value) {
      const savedIds = JSON.parse(value);
      if (Array.isArray(savedIds) && savedIds.length > 0) {
        visibleWaterStationIds.value = savedIds;
      }
    }
  } catch (error) {
    console.warn('Failed to load visible water stations preference:', error);
    // Keep default of just first station
  }
}

// Save visible water stations to storage
async function saveVisibleWaterStations() {
  try {
    await Preferences.set({
      key: 'visibleWaterStations',
      value: JSON.stringify(visibleWaterStationIds.value)
    });
  } catch (error) {
    console.warn('Failed to save visible water stations preference:', error);
  }
}

// Toggle visibility of a water station
function toggleWaterStationVisibility(stationId: number) {
  const index = visibleWaterStationIds.value.indexOf(stationId);
  if (index > -1) {
    // Remove station (but keep at least one visible)
    if (visibleWaterStationIds.value.length > 1) {
      visibleWaterStationIds.value.splice(index, 1);
    }
  } else {
    // Add station
    visibleWaterStationIds.value.push(stationId);
  }
  saveVisibleWaterStations();
}

// Toggle settings panel visibility
function toggleStationSettings() {
  showStationSettings.value = !showStationSettings.value;
}

// Computed property for filtered visible water stations
const visibleWaterStations = computed(() => {
  return waterLevelData.value.filter(station => visibleWaterStationIds.value.includes(station.id));
});

// Load preferences on mount
onMounted(async () => {
  await loadVisibleWaterStations();
  // Add click outside listener
  document.addEventListener('click', handleClickOutside);
});

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

function getStatusText(level: number, criticalLevel: number): string {
  if (level >= criticalLevel) return '⚠️ Critical';
  if (level >= criticalLevel * 0.8) return '⚡ Warning';
  return '✓ Normal';
}
</script>

<style scoped>
/* Slide down animation for settings panel */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Bubble styles */
.bubble {
  position: absolute;
  bottom: 0;
  border-radius: 50%;
  opacity: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.4));
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.3);
  animation: bubble linear infinite;
}

.bubble-1 {
  left: 15%;
  width: 6px;
  height: 6px;
  animation-duration: 3s;
  animation-delay: 0s;
}

.bubble-2 {
  left: 35%;
  width: 8px;
  height: 8px;
  animation-duration: 4s;
  animation-delay: 0.5s;
}

.bubble-3 {
  left: 55%;
  width: 5px;
  height: 5px;
  animation-duration: 3.5s;
  animation-delay: 1s;
}

.bubble-4 {
  left: 75%;
  width: 7px;
  height: 7px;
  animation-duration: 4.5s;
  animation-delay: 1.5s;
}

.bubble-5 {
  left: 25%;
  width: 6px;
  height: 6px;
  animation-duration: 3.8s;
  animation-delay: 2s;
}

.bubble-6 {
  left: 65%;
  width: 5px;
  height: 5px;
  animation-duration: 4.2s;
  animation-delay: 2.5s;
}

/* Water shimmer */
.water-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.25) 50%,
    transparent 100%
  );
  animation: shimmer 3s ease-in-out infinite;
  transform: skewX(-20deg);
  pointer-events: none;
}

/* Custom animations for water effects */
@keyframes wave {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

@keyframes bubble {
  0% {
    bottom: 0;
    opacity: 0;
    transform: translateX(0) scale(1);
  }
  10% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
    transform: translateX(8px) scale(1.15);
  }
  90% {
    opacity: 0.6;
  }
  100% {
    bottom: 100%;
    opacity: 0;
    transform: translateX(-8px) scale(0.7);
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  50%, 100% {
    left: 100%;
  }
}

/* Responsive: keep gauge left and data right on small screens; only tweak sizes */
@media (max-width: 640px) {
  /* Slightly reduce gauge height on small screens */
  .h-\[200px\] {
    height: 160px;
  }

  /* Keep the gauge column fixed width so it remains at left */
  .flex-none.w-\[100px\] {
    width: 92px;
  }

  /* Scale down the large reading value */
  .text-\[2\.5rem\] {
    font-size: 2rem;
  }

  /* Ensure the main gauge/data flex keeps horizontal flow */
  .gauge-section {
    gap: 0.75rem;
    align-items: flex-start;
  }

  /* Make data grid adapt but remain stacked vertically inside the right column */
  .data-grid {
    flex-direction: column;
  }
}
</style>
