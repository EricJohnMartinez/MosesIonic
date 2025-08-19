<template>
  <div class="container mx-auto py-6 px-2">
    <h2 class="text-2xl font-bold mb-4 text-center text-white drop-shadow">7-Day Weather Summary</h2>
    <!-- Station Dropdown Selector -->
    <div class="flex justify-center mb-6">
      <div class="flex items-center gap-2 bg-gradient-to-r from-blue-100/80 via-white/80 to-blue-100/80 backdrop-blur-md rounded-full shadow px-5 py-2 border border-blue-200">
        <label for="station-select" class="mr-2 font-bold text-blue-700 tracking-wide">Station:</label>
        <div class="relative flex-1">
          <select
            id="station-select"
            v-model="selectedStation"
            class="appearance-none w-full rounded-full px-5 py-2 border-2 border-blue-400 bg-white text-blue-700 font-bold shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-center pr-10"
          >
            <option v-for="station in stations" :key="station.id" :value="station.id">{{ station.name }}</option>
          </select>
          <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 text-lg">▼</span>
        </div>
      </div>
    </div>

    <div v-if="currentStation" class="bg-white/90 rounded-3xl shadow-2xl p-6 sm:p-8 mb-8 border border-blue-200">
      <h3 class="text-xl font-bold mb-4 text-blue-700 text-center">{{ currentStation.name }}</h3>
      <!-- Simple SVG Chart Placeholder -->
  <div class="mb-6">
  <svg viewBox="0 0 320 100" width="100%" height="100" class="mb-2">
          <!-- Temperature Line -->
          <polyline
            :points="chartPoints(currentStation.summary, 'temperature')"
            fill="none" stroke="#3b82f6" stroke-width="2"/>
          <!-- Heat Index Line -->
          <polyline
            :points="chartPoints(currentStation.summary, 'heatIndex')"
            fill="none" stroke="#ef4444" stroke-width="2"/>
        </svg>
  <div class="flex justify-between text-xs text-gray-700">
          <span v-for="(day, idx) in currentStation.summary" :key="idx">{{ dayOfWeek(idx) }}</span>
        </div>
  <div class="flex gap-4 mt-1">
          <span class="flex items-center text-blue-600"><span class="w-3 h-1 bg-blue-600 inline-block mr-1"></span>Temp</span>
          <span class="flex items-center text-red-500"><span class="w-3 h-1 bg-red-500 inline-block mr-1"></span>Heat Index</span>
        </div>
      </div>
      <div class="overflow-x-auto rounded-xl mt-4">
        <table class="min-w-full text-center text-base">
          <thead>
            <tr class="bg-blue-200 text-blue-900">
              <th class="px-3 py-2">Day</th>
              <th class="px-3 py-2">Temp (°C)</th>
              <th class="px-3 py-2">Heat Index (°C)</th>
              <th class="px-3 py-2">Humidity (%)</th>
              <th class="px-3 py-2">Rainfall (mm)</th>
              <th class="px-3 py-2">Wind Speed (m/s)</th>
              <th class="px-3 py-2">Wind Dir.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(day, idx) in currentStation.summary" :key="idx" :class="idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'">
              <td class="px-3 py-2 font-bold text-blue-700">{{ dayOfWeek(idx) }}</td>
              <td class="px-3 py-2">{{ day.temperature }}</td>
              <td class="px-3 py-2">{{ day.heatIndex }}</td>
              <td class="px-3 py-2">{{ day.humidity }}</td>
              <td class="px-3 py-2">{{ day.rainfall }}</td>
              <td class="px-3 py-2">{{ day.windSpeed }}</td>
              <td class="px-3 py-2">{{ day.windDirection }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="flex justify-center">
      <router-link to="/home" class="mt-4 px-6 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition">Back to Dashboard</router-link>
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
