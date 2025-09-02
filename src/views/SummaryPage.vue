<template>
  <div class="container mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 min-h-screen">
    <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-center text-white drop-shadow">7-Day Weather Summary</h2>
    
    <!-- Station Dropdown Selector -->
    <div class="flex justify-center mb-4 sm:mb-6">
      <div class="flex items-center gap-2 bg-gradient-to-r from-blue-100/80 via-white/80 to-blue-100/80 backdrop-blur-md rounded-full shadow px-3 sm:px-5 py-2 border border-blue-200 w-full max-w-xs sm:max-w-md">
        <label for="station-select" class="mr-2 font-bold text-blue-700 tracking-wide text-sm sm:text-base">Station:</label>
        <div class="relative flex-1">
          <select
            id="station-select"
            v-model="selectedStation"
            class="appearance-none w-full rounded-full px-3 sm:px-5 py-2 border-2 border-blue-400 bg-white text-blue-700 font-bold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-center pr-8 sm:pr-10 text-sm sm:text-base touch-manipulation"
          >
            <option v-for="station in stations" :key="station.id" :value="station.id">{{ station.name }}</option>
          </select>
          <span class="pointer-events-none absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-blue-500 text-sm sm:text-lg">▼</span>
        </div>
      </div>
    </div>

    <div v-if="currentStation" class="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-blue-200">
      <h3 class="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-blue-700 text-center">{{ currentStation.name }}</h3>
      
      <!-- Chart Section -->
      <div class="mb-4 sm:mb-6">
        <!-- SVG Chart -->
        <div class="bg-gray-50 rounded-xl p-4 mb-4">
          <svg viewBox="0 0 320 100" class="w-full h-20 sm:h-24 lg:h-28 mb-2">
            <!-- Temperature Line -->
            <polyline
              :points="chartPoints(currentStation.summary, 'temperature')"
              fill="none" stroke="#3b82f6" stroke-width="2"/>
            <!-- Heat Index Line -->
            <polyline
              :points="chartPoints(currentStation.summary, 'heatIndex')"
              fill="none" stroke="#ef4444" stroke-width="2"/>
          </svg>
          
          <!-- Day labels -->
          <div class="flex justify-between text-xs sm:text-sm text-gray-700 px-2">
            <span v-for="(day, idx) in currentStation.summary" :key="idx">{{ dayOfWeek(idx) }}</span>
          </div>
          
          <!-- Legend -->
          <div class="flex gap-4 sm:gap-6 mt-2 justify-center">
            <span class="flex items-center text-blue-600 text-xs sm:text-sm">
              <span class="w-3 h-1 bg-blue-600 inline-block mr-1 sm:mr-2"></span>Temperature
            </span>
            <span class="flex items-center text-red-500 text-xs sm:text-sm">
              <span class="w-3 h-1 bg-red-500 inline-block mr-1 sm:mr-2"></span>Heat Index
            </span>
          </div>
        </div>
        
        <!-- Responsive Table Container -->
        <div class="overflow-x-auto rounded-xl shadow-inner bg-gray-50">
          <table class="min-w-full text-center text-xs sm:text-sm lg:text-base">
            <thead>
              <tr class="bg-blue-200 text-blue-900">
                <th class="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Day</th>
                <th class="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Temp<br class="sm:hidden">(°C)</th>
                <th class="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-semibold hidden sm:table-cell">Heat Index (°C)</th>
                <th class="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Humidity<br class="sm:hidden">(%)</th>
                <th class="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-semibold">Rain<br class="sm:hidden">(mm)</th>
                <th class="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-semibold hidden md:table-cell">Wind Speed (m/s)</th>
                <th class="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-semibold hidden lg:table-cell">Wind Direction</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(day, idx) in currentStation.summary" :key="idx" :class="idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'">
                <td class="px-2 sm:px-3 py-2 sm:py-3 font-bold text-blue-700 text-xs sm:text-sm">{{ dayOfWeek(idx) }}</td>
                <td class="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm">{{ day.temperature }}°</td>
                <td class="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm hidden sm:table-cell">{{ day.heatIndex }}°</td>
                <td class="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm">{{ day.humidity }}%</td>
                <td class="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm">{{ day.rainfall }}</td>
                <td class="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm hidden md:table-cell">{{ day.windSpeed }}</td>
                <td class="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm hidden lg:table-cell">{{ day.windDirection }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Mobile-only additional info cards for hidden columns -->
        <div class="grid grid-cols-1 sm:hidden gap-3 mt-4">
          <div v-for="(day, idx) in currentStation.summary" :key="`mobile-${idx}`" 
               class="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold text-blue-700 text-sm">{{ dayOfWeek(idx) }}</span>
              <span class="text-xs text-gray-500">{{ day.temperature }}° / {{ day.heatIndex }}°</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="flex justify-between">
                <span class="text-gray-600">Wind:</span>
                <span>{{ day.windSpeed }} m/s {{ day.windDirection }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Back Button -->
    <div class="flex justify-center pb-safe">
      <router-link to="/home" 
        class="w-full sm:w-auto mt-4 px-6 py-3 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600 transition-all duration-300 text-center font-semibold text-sm sm:text-base touch-manipulation min-h-[44px] flex items-center justify-center">
        ← Back to Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const stations = ref([
  {
    id: 'minsu',
    name: 'MinSU Station',
    summary: randomSummary(),
  },
  {
    id: 'sanandres',
    name: 'San Andres Station',
    summary: randomSummary(),
  },
  {
    id: 'calapan',
    name: 'Calapan Station',
    summary: randomSummary(),
  },
]);

const selectedStation = ref('minsu');

function selectStation(id: string) {
  selectedStation.value = id;
}

function randomSummary() {
  return Array.from({ length: 7 }, () => ({
    temperature: Math.round(24 + Math.random() * 12),
    humidity: Math.round(50 + Math.random() * 50),
    rainfall: +(Math.random() * 10).toFixed(1),
    windSpeed: +(Math.random() * 10).toFixed(1),
    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
    heatIndex: Math.round(28 + Math.random() * 12),
  }));
}

const currentStation = computed(() => stations.value.find(s => s.id === selectedStation.value));

function dayOfWeek(idx: number) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();
  return days[(today - 6 + idx + 7) % 7];
}

// Chart points generator for SVG polyline
function chartPoints(summary: any[], key: string) {
  // Map values to 0-100 (y axis, inverted), x axis is 0-320
  const values = summary.map(day => day[key]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return values.map((v, i) => {
    const x = (i / (values.length - 1)) * 320;
    const y = 100 - ((v - min) / (max - min || 1)) * 80 - 10; // 10px padding
    return `${x},${y}`;
  }).join(' ');
}
</script>
