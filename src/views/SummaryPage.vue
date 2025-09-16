<template>
  <IonContent class="ion-no-padding" fullscreen scrollEvents @ionScroll="handleIonScroll">
    <!-- Pull to refresh -->
    <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
      <IonRefresherContent pulling-text="Pull to refresh" refreshing-spinner="lines" />
    </IonRefresher>

    <div class="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <!-- Station selector button - positioned responsively -->
      <div class="fixed top-4 right-4 z-50" :style="{ top: 'calc(env(safe-area-inset-top) + 1rem)' }">
        <button type="button" aria-label="Open Stations Menu" @click="toggleNav"
          class="bg-gray-800/90 backdrop-blur-md text-white p-3 rounded-xl shadow-lg border border-gray-700 hover:bg-gray-700/90 transition-all duration-200 flex items-center space-x-2 min-h-[44px]">
          <span class="text-lg">📍</span>
          <span class="font-medium text-sm hidden sm:inline">{{ currentStation?.name || 'Select Station' }}</span>
          <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isNavOpen }" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Side Navigation Overlay -->
      <div v-if="isNavOpen" @click="closeNav"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        :class="{ 'opacity-100': isNavOpen, 'opacity-0': !isNavOpen }">
      </div>

      <!-- Side Navigation Panel -->
      <div
        class="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-gray-900/95 backdrop-blur-lg border-l border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 ease-out nav-panel"
        :class="{ 'translate-x-0': isNavOpen, 'translate-x-full': !isNavOpen }"
        :style="{ paddingTop: 'env(safe-area-inset-top)' }">

        <!-- Navigation Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 class="text-xl font-bold text-white">Weather Stations</h2>
          <button @click="closeNav" aria-label="Close Navigation"
            class="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Station List -->
        <div class="flex-1 overflow-y-auto p-4">
          <div class="space-y-3">
            <div v-for="(station, index) in stations" :key="station.id" @click="changeStation(station.id, index)"
              :class="[
                'group relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg station-card',
                selectedStation === station.id
                  ? 'active bg-blue-600/20 border-blue-500 shadow-blue-500/20'
                  : 'bg-gray-800/50 border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
              ]">

              <!-- Station Icon and Status -->
              <div class="flex items-center space-x-3 mb-3">
                <div :class="[
                  'w-4 h-4 rounded-full transition-all duration-300',
                  selectedStation === station.id ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                ]"></div>
                <span class="text-lg">📍</span>
                <span :class="[
                  'font-semibold transition-colors duration-200',
                  selectedStation === station.id ? 'text-blue-300' : 'text-white group-hover:text-blue-200'
                ]">{{ station.name }}</span>

                <!-- Selected Badge -->
                <div v-if="selectedStation === station.id"
                  class="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Active
                </div>
              </div>

              <!-- Station Preview Data (if it's the selected station) -->
              <div v-if="selectedStation === station.id" class="text-gray-400 text-sm">
                <div class="flex items-center space-x-2">
                  <span>📍</span>
                  <span>{{ station.lat.toFixed(4) }}, {{ station.lng.toFixed(4) }}</span>
                </div>
              </div>

              <!-- Coordinates for non-selected stations -->
              <div v-else class="text-gray-400 text-sm">
                <div class="flex items-center space-x-2">
                  <span>📍</span>
                  <span>{{ station.lat.toFixed(4) }}, {{ station.lng.toFixed(4) }}</span>
                </div>
              </div>

              <!-- Hover Arrow -->
              <div
                class="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Additional Navigation Options -->
          <div class="mt-6 pt-6 border-t border-gray-700 space-y-3">
            <router-link to="/home"
              class="w-full flex items-center space-x-3 p-4 rounded-xl bg-gray-800/50 border border-gray-600 hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-200">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span class="text-white font-medium">Back to Dashboard</span>
            </router-link>
          </div>
        </div>
      </div>

      <main class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all duration-1000 ease-out"
        :class="getParallaxClass()"
        v-if="currentStation"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd">

        <!-- Header Section -->
        <div class="text-center mb-6 sm:mb-8 pt-4">
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            📊 7-Day Weather Summary
          </h1>
          <p class="text-gray-300 text-sm sm:text-base">Historical weather data analysis</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span class="ml-3 text-white">Loading weather data...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-900/50 backdrop-blur-sm border border-red-700 rounded-xl p-6 text-center mx-4">
          <div class="text-red-400 text-lg mb-2">⚠️ Error Loading Data</div>
          <p class="text-red-300">{{ error }}</p>
          <button
            @click="fetchSummaryData"
            class="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>

        <!-- Summary Data -->
        <div v-else-if="summaryData.length > 0" class="space-y-6">
          <!-- Current Station Info -->
          <div class="bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-700/50 text-center">
            <h2 class="text-xl sm:text-2xl font-bold text-white mb-2">
              {{ currentStation?.name }}
            </h2>
            <p class="text-gray-300 text-sm">7-day weather analysis</p>
          </div>

          <!-- Summary Cards -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div class="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-4 text-center border border-slate-700/50 card-hover card-transition">
              <div class="text-2xl mb-1">🌡️</div>
              <div class="text-sm text-gray-300">Avg Temp</div>
              <div class="text-lg font-bold text-blue-400">{{ averageTemp }}°C</div>
            </div>
            <div class="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-4 text-center border border-slate-700/50 card-hover card-transition">
              <div class="text-2xl mb-1">💧</div>
              <div class="text-sm text-gray-300">Avg Humidity</div>
              <div class="text-lg font-bold text-green-400">{{ averageHumidity }}%</div>
            </div>
            <div class="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-4 text-center border border-slate-700/50 card-hover card-transition">
              <div class="text-2xl mb-1">💨</div>
              <div class="text-sm text-gray-300">Avg Wind</div>
              <div class="text-lg font-bold text-blue-400">{{ averageWindSpeed }} m/s</div>
            </div>
            <div class="bg-slate-800/60 backdrop-blur-lg rounded-2xl p-4 text-center border border-slate-700/50 card-hover card-transition">
              <div class="text-2xl mb-1">🌧️</div>
              <div class="text-sm text-gray-300">Total Rain</div>
              <div class="text-lg font-bold text-blue-400">{{ totalRainfall }} mm</div>
            </div>
          </div>

          <!-- Vertical Daily Summary Table -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-white mb-4 text-center">Daily Weather Summary</h3>

            <!-- Daily Cards -->
            <div v-for="(day, index) in summaryData" :key="index"
                 :class="[
                   'bg-slate-800/60 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-md border border-slate-700/50 card-hover card-transition',
                   getCardAnimationClass(index)
                 ]"
                 :style="{ animationDelay: `${index * 0.1}s` }">

              <!-- Day Header -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <div class="text-2xl">{{ getWeatherIcon(day) }}</div>
                  <div>
                    <h4 class="text-lg font-bold text-white">{{ formatDate(day.date) }}</h4>
                    <p class="text-sm text-gray-300">{{ getDayName(day.date) }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xl font-bold text-white">{{ day.temperature.toFixed(2) }}°C</div>
                  <div class="text-xs text-gray-400">High</div>
                </div>
              </div>

              <!-- Weather Metrics Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <!-- Temperature -->
                <div class="bg-slate-700/50 rounded-xl p-3 text-center">
                  <div class="text-lg font-bold text-blue-400 mb-1">{{ day.temperature.toFixed(2) }}°</div>
                  <div class="text-xs text-gray-300">Temperature</div>
                  <!-- Temperature Bar -->
                  <div class="w-full h-2 bg-slate-600/50 rounded-full mt-2 overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000"
                         :style="{ width: getTemperatureBarWidth(day.temperature) }"></div>
                  </div>
                </div>

                <!-- Humidity -->
                <div class="bg-slate-700/50 rounded-xl p-3 text-center">
                  <div class="text-lg font-bold text-green-400 mb-1">{{ day.humidity.toFixed(2) }}%</div>
                  <div class="text-xs text-gray-300">Humidity</div>
                  <!-- Humidity Bar -->
                  <div class="w-full h-2 bg-slate-600/50 rounded-full mt-2 overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000"
                         :style="{ width: `${day.humidity}%` }"></div>
                  </div>
                </div>

                <!-- Wind Speed -->
                <div class="bg-slate-700/50 rounded-xl p-3 text-center">
                  <div class="text-lg font-bold text-blue-400 mb-1">{{ day.windSpeed.toFixed(2) }}</div>
                  <div class="text-xs text-gray-300">Wind (m/s)</div>
                  <!-- Wind Bar -->
                  <div class="w-full h-2 bg-slate-600/50 rounded-full mt-2 overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000"
                         :style="{ width: getWindBarWidth(day.windSpeed) }"></div>
                  </div>
                </div>

                <!-- Rainfall -->
                <div class="bg-slate-700/50 rounded-xl p-3 text-center">
                  <div class="text-lg font-bold text-blue-400 mb-1">{{ day.rainfall.toFixed(2) }}</div>
                  <div class="text-xs text-gray-300">Rain (mm)</div>
                  <!-- Rain Bar -->
                  <div class="w-full h-2 bg-slate-600/50 rounded-full mt-2 overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-1000"
                         :style="{ width: getRainBarWidth(day.rainfall) }"></div>
                  </div>
                </div>
              </div>

              <!-- Additional Info -->
              <div class="mt-4 pt-4 border-t border-slate-600/50">
                <div class="flex justify-between items-center text-sm">
                  <span class="text-gray-400">Wind Direction:</span>
                  <span class="text-white font-medium">{{ day.windDirection }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Data State -->
        <div v-else class="bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center border border-slate-700/50 mx-4">
          <div class="text-6xl mb-4">📊</div>
          <h3 class="text-xl font-semibold text-white mb-2">No Data Available</h3>
          <p class="text-gray-300 mb-4">Weather data for this station is not available yet.</p>
          <button
            @click="fetchSummaryData"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </main>
    </div>
  </IonContent>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { getDatabase, ref as dbRef, get, query, orderByKey, limitToLast, startAt } from 'firebase/database';
import { IonContent, IonRefresher, IonRefresherContent } from '@ionic/vue';

// Reactive state
const selectedStation = ref('station1');
const loading = ref(false);
const error = ref('');
const summaryData = ref<any[]>([]);

// Station configuration
const stations = ref([
  { id: 'station1', name: 'MinSU Station', lat: 13.153925, lng: 121.185337 },
  { id: 'station2', name: 'San Andres Station', lat: 13.142357, lng: 121.156572 },
]);

// Side navigation state
const isNavOpen = ref(false);

// Station transition animation states
const isTransitioning = ref(false);
const transitionDirection = ref<'left' | 'right'>('left');

// Swipe functionality
const touchStartX = ref(0);
const touchStartY = ref(0);
const touchEndX = ref(0);
const touchEndY = ref(0);
const isSwipeActive = ref(false);
const swipeThreshold = 50;
const swipeTimeThreshold = 300;
const swipeStartTime = ref(0);

// Computed properties
const currentStation = computed(() =>
  stations.value.find(s => s.id === selectedStation.value)
);

const averageTemp = computed(() => {
  if (summaryData.value.length === 0) return 0;
  const sum = summaryData.value.reduce((acc, day) => acc + day.temperature, 0);
  return (sum / summaryData.value.length).toFixed(2);
});

const averageHumidity = computed(() => {
  if (summaryData.value.length === 0) return 0;
  const sum = summaryData.value.reduce((acc, day) => acc + day.humidity, 0);
  return (sum / summaryData.value.length).toFixed(2);
});

const averageWindSpeed = computed(() => {
  if (summaryData.value.length === 0) return 0;
  const sum = summaryData.value.reduce((acc, day) => acc + day.windSpeed, 0);
  return (sum / summaryData.value.length).toFixed(2);
});

const totalRainfall = computed(() => {
  if (summaryData.value.length === 0) return 0;
  const sum = summaryData.value.reduce((acc, day) => acc + day.rainfall, 0);
  return sum.toFixed(2);
});

// Firebase data fetching
async function fetchSummaryData() {
  if (!currentStation.value) return;

  loading.value = true;
  error.value = '';

  try {
    const db = getDatabase();
    const stationId = selectedStation.value;

    console.log('🔍 SummaryPage: Fetching data for station:', stationId);

    // Define sensor types like in HomePage.vue
    const sensorTypes = [
      { key: 'TEM', label: 'temperature' },
      { key: 'HUM', label: 'humidity' },
      { key: 'RR', label: 'rainfall' },
      { key: 'WSP', label: 'windSpeed' },
      { key: 'WD', label: 'windDirection' }
    ];

    const allSensorData: any[] = [];

    // Fetch data for each sensor type
    for (const sensor of sensorTypes) {
      try {
        const sensorRef = dbRef(db, `${stationId}/data/sensors/${sensor.key}`);
        console.log(`🔍 SummaryPage: Fetching ${sensor.key} from path:`, `${stationId}/data/sensors/${sensor.key}`);

        // Get data from the last 7 days more precisely
        // Handle timezone conversion (Firebase stores in UTC, we need Philippines time UTC+8)
        const now = new Date()
        const sevenDaysAgoLocal = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
        const sevenDaysAgoLocalStart = new Date(sevenDaysAgoLocal.getFullYear(), sevenDaysAgoLocal.getMonth(), sevenDaysAgoLocal.getDate())
        const sevenDaysAgoUTC = Math.floor(sevenDaysAgoLocalStart.getTime() / 1000) + (8 * 60 * 60) // Convert to UTC timestamp

        const sensorQuery = query(sensorRef, orderByKey(), startAt(sevenDaysAgoUTC.toString()))

        const snapshot = await get(sensorQuery);

        if (snapshot.exists()) {
          const sensorData = snapshot.val();
          console.log(`✅ SummaryPage: Found ${sensor.key} data:`, sensorData);

          // Process each timestamp for this sensor
          Object.entries(sensorData).forEach(([timestamp, value]: [string, any]) => {
            // Handle nested Firebase structure like HomePage.vue
            let finalValue: any = value?.val ?? value ?? 0;
            if (sensor.key !== 'WD' && typeof finalValue === 'string') {
              finalValue = parseFloat(finalValue) || 0;
            }

            // Convert timestamp from UTC to local time (subtract 8 hours for Philippines UTC+8)
            const utcTimestamp = parseInt(timestamp);
            const localTimestamp = utcTimestamp - (8 * 60 * 60); // Convert from UTC to Philippines time
            const localDate = new Date(localTimestamp * 1000);

            allSensorData.push({
              timestamp: localDate.getTime(), // Store as milliseconds for JavaScript Date
              sensor: sensor.key,
              value: finalValue
            });
          });
        } else {
          console.log(`⚠️ SummaryPage: No ${sensor.key} data found`);
        }
      } catch (sensorError) {
        console.error(`Error fetching ${sensor.key}:`, sensorError);
      }
    }

    console.log('🔍 SummaryPage: All sensor data collected:', allSensorData);

    if (allSensorData.length === 0) {
      console.log('❌ SummaryPage: No sensor data found at all');
      summaryData.value = [];
      return;
    }

    // Group data by date and sensor type
    const dailyData: { [key: string]: { [sensor: string]: any[] } } = {};

    allSensorData.forEach(data => {
      const date = new Date(data.timestamp).toDateString(); // timestamp is already in milliseconds (local time)
      console.log(`🔍 SummaryPage: Processing timestamp ${data.timestamp} -> date: ${date} (local time)`);

      if (!dailyData[date]) {
        dailyData[date] = {};
      }

      if (!dailyData[date][data.sensor]) {
        dailyData[date][data.sensor] = [];
      }

      dailyData[date][data.sensor].push(data.value);
    });

    console.log('🔍 SummaryPage: Daily data grouped by sensor:', dailyData);

    // Calculate daily averages for each sensor
    const processedData: any[] = [];

    Object.entries(dailyData).forEach(([date, sensorData]) => {
      const dayData: any = {
        date: new Date(date),
        temperature: 0,
        humidity: 0,
        rainfall: 0,
        windSpeed: 0,
        windDirection: 'N'
      };

      // Calculate averages for each sensor
      Object.entries(sensorData).forEach(([sensor, values]: [string, any[]]) => {
        if (sensor === 'TEM' && values.length > 0) {
          dayData.temperature = parseFloat((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2));
        } else if (sensor === 'HUM' && values.length > 0) {
          dayData.humidity = parseFloat((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2));
        } else if (sensor === 'RR' && values.length > 0) {
          dayData.rainfall = parseFloat(values.reduce((sum, val) => sum + val, 0).toFixed(2)); // Sum rainfall
        } else if (sensor === 'WSP' && values.length > 0) {
          dayData.windSpeed = parseFloat((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2));
        } else if (sensor === 'WD' && values.length > 0) {
          // Get most common wind direction
          const windDirs = values.filter(v => v && v !== 'N');
          dayData.windDirection = windDirs.length > 0 ? windDirs[0] : 'N';
        }
      });

      processedData.push(dayData);
    });

    // Sort by date (oldest first)
    processedData.sort((a, b) => a.date.getTime() - b.date.getTime());

    summaryData.value = processedData;

    console.log('✅ SummaryPage: Final processed data:', processedData);
    console.log('✅ SummaryPage: Summary data length:', processedData.length);

  } catch (err: any) {
    console.error('Error fetching summary data:', err);
    error.value = err.message || 'Failed to load weather data';
    summaryData.value = [];
  } finally {
    loading.value = false;
  }
}

// Helper functions for styling
function getTemperatureBarWidth(temp: number): string {
  // Scale temperature bar based on typical range (15°C to 40°C)
  const minTemp = 15;
  const maxTemp = 40;
  const normalizedTemp = Math.max(0, Math.min(100, ((temp - minTemp) / (maxTemp - minTemp)) * 100));
  return `${normalizedTemp}%`;
}

function getWindBarWidth(windSpeed: number): string {
  // Scale wind speed bar based on typical range (0 to 20 m/s)
  const maxWind = 20;
  const normalizedWind = Math.max(0, Math.min(100, (windSpeed / maxWind) * 100));
  return `${normalizedWind}%`;
}

function getRainBarWidth(rainfall: number): string {
  // Scale rainfall bar based on typical range (0 to 50 mm)
  const maxRain = 50;
  const normalizedRain = Math.max(0, Math.min(100, (rainfall / maxRain) * 100));
  return `${normalizedRain}%`;
}

// Weather icon based on conditions
function getWeatherIcon(day: any): string {
  if (day.rainfall > 10) return '🌧️';
  if (day.temperature > 30) return '☀️';
  if (day.temperature < 20) return '❄️';
  return '⛅';
}

// Date formatting
function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

function getDayName(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long'
  };
  return date.toLocaleDateString('en-US', options);
}

// Station change with parallax transition
function changeStation(stationId: string, index: number) {
  if (stationId === selectedStation.value) return;
  // Close navigation
  isNavOpen.value = false;
  // Set transition direction for parallax
  transitionDirection.value = index > stations.value.findIndex(s => s.id === selectedStation.value) ? 'left' : 'right';
  isTransitioning.value = true;
  // Trigger parallax animation for all main content items
  setTimeout(() => {
    selectedStation.value = stationId;
    // End transition after animation duration
    setTimeout(() => {
      isTransitioning.value = false;
    }, 600);
  }, 10);
}

// Helper to get parallax class for main content
function getParallaxClass() {
  if (isTransitioning.value) {
    return transitionDirection.value === 'left' ? 'parallax-left' : 'parallax-right';
  }
  return '';
}

// Side navigation functions
function toggleNav() {
  isNavOpen.value = !isNavOpen.value;
}

function closeNav() {
  isNavOpen.value = false;
}

// Swipe functionality for station switching
function handleTouchStart(event: TouchEvent) {
  if (isTransitioning.value || isNavOpen.value) return;

  const touch = event.touches[0];
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
  touchEndX.value = touch.clientX;
  touchEndY.value = touch.clientY;
  isSwipeActive.value = true;
  swipeStartTime.value = Date.now();
}

function handleTouchMove(event: TouchEvent) {
  if (!isSwipeActive.value) return;

  const touch = event.touches[0];
  touchEndX.value = touch.clientX;
  touchEndY.value = touch.clientY;

  // Prevent default scroll behavior for horizontal swipes
  const deltaX = Math.abs(touchEndX.value - touchStartX.value);
  const deltaY = Math.abs(touchEndY.value - touchStartY.value);

  if (deltaX > deltaY && deltaX > 20) {
    event.preventDefault();
  }
}

function handleTouchEnd(event: TouchEvent) {
  if (!isSwipeActive.value) return;

  isSwipeActive.value = false;
  const swipeTime = Date.now() - swipeStartTime.value;

  // Check if swipe was fast enough
  if (swipeTime > swipeTimeThreshold) return;

  const deltaX = touchEndX.value - touchStartX.value;
  const deltaY = touchEndY.value - touchStartY.value;

  // Check if horizontal swipe distance is greater than vertical
  if (Math.abs(deltaX) < Math.abs(deltaY)) return;

  // Check if swipe distance meets threshold
  if (Math.abs(deltaX) < swipeThreshold) return;

  // Add haptic feedback if available
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }

  // Determine swipe direction and switch station
  if (deltaX > 0) {
    // Swipe right - go to previous station
    switchToPreviousStation();
  } else {
    // Swipe left - go to next station
    switchToNextStation();
  }
}

function switchToNextStation() {
  const currentIndex = stations.value.findIndex(s => s.id === selectedStation.value);
  const nextIndex = (currentIndex + 1) % stations.value.length;
  const nextStation = stations.value[nextIndex];
  changeStation(nextStation.id, nextIndex);
}

function switchToPreviousStation() {
  const currentIndex = stations.value.findIndex(s => s.id === selectedStation.value);
  const prevIndex = currentIndex === 0 ? stations.value.length - 1 : currentIndex - 1;
  const prevStation = stations.value[prevIndex];
  changeStation(prevStation.id, prevIndex);
}

// Pull-to-refresh handler
const handleRefresh = async (event: any) => {
  try {
    await fetchSummaryData();
    await new Promise((resolve) => setTimeout(resolve, 700));
  } catch (err) {
    console.error('Error during pull-to-refresh:', err);
  } finally {
    try { event.target.complete(); } catch (e) { /* ignore */ }
  }
};

// Ionic IonContent scroll handler
function handleIonScroll(ev: any) {
  // No scroll progress or parallax effect for summary page
}

// Dynamic animation classes based on pattern and card position
const getCardAnimationClass = computed(() => {
  return (cardIndex: number, baseClass: string = '') => {
    if (isTransitioning.value) {
      return `${baseClass} card-transition-out`;
    }

    // Each card gets a different animation pattern based on its index
    const patterns = ['spiral-in', 'cascade-wave', 'radial-burst', 'corner-sweep', 'zigzag-flow', 'layered-depth'];
    const cardPattern = patterns[cardIndex % patterns.length];
    const delay = cardIndex * 80;

    const animationClass = `card-${cardPattern}`;
    const delayClass = `animation-delay-${Math.min(delay, 500)}`;

    return `${baseClass} ${animationClass} ${delayClass}`;
  };
});

// Watch for station changes
watch(selectedStation, () => {
  fetchSummaryData();
});

// Initialize on mount
onMounted(() => {
  fetchSummaryData();
});

// Placeholder functions for navigation (can be implemented later)
function openMapModal() {
  // Map modal functionality can be added later
}
</script>

<style scoped>
/* Side Navigation Animations */
.nav-slide-enter-active,
.nav-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.0, 0.0, 0.2, 1);
}

.nav-slide-enter-from {
  transform: translateX(100%);
}

.nav-slide-leave-to {
  transform: translateX(100%);
}

.nav-overlay-enter-active,
.nav-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.nav-overlay-enter-from,
.nav-overlay-leave-to {
  opacity: 0;
}

/* Navigation Panel Enhancements */
.nav-panel {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Station Card Hover Effects */
.station-card {
  background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%);
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.station-card:hover {
  background: linear-gradient(135deg, rgba(55, 65, 81, 0.9) 0%, rgba(31, 41, 55, 0.95) 100%);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1);
}

.station-card.active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.2) 0%, rgba(29, 78, 216, 0.3) 100%);
  border-color: rgba(59, 130, 246, 0.8);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
}

/* Card Hover Effects */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* Card Transition Effects */
.card-transition {
  transition: all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* Parallax Effects */
@keyframes parallax-left {
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateX(-10px) scale(0.98);
    opacity: 0.8;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes parallax-right {
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateX(10px) scale(0.98);
    opacity: 0.8;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

.parallax-left {
  animation: parallax-left 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.parallax-right {
  animation: parallax-right 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);
}

/* Card Animation Classes */
.card-spiral-in {
  animation: cardSpiralIn 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
}

.card-cascade-wave {
  animation: cardCascadeWave 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
}

.card-radial-burst {
  animation: cardRadialBurst 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
}

.card-corner-sweep {
  animation: cardCornerSweep 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
}

.card-zigzag-flow {
  animation: cardZigzagFlow 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
}

.card-layered-depth {
  animation: cardLayeredDepth 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
}

/* Animation Keyframes */
@keyframes cardSpiralIn {
  0% {
    transform: translateX(-200px) translateY(-200px) rotate(-360deg) scale(0.1);
    opacity: 0;
  }
  100% {
    transform: translateX(0) translateY(0) rotate(0deg) scale(1);
    opacity: 1;
  }
}

@keyframes cardCascadeWave {
  0% {
    transform: translateY(-100px) rotateX(90deg);
    opacity: 0;
  }
  100% {
    transform: translateY(0) rotateX(0deg);
    opacity: 1;
  }
}

@keyframes cardRadialBurst {
  0% {
    transform: scale(0.1) rotate(-180deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes cardCornerSweep {
  0% {
    transform: translate(-100vw, -100vh) scale(0.8) rotate(-15deg);
    opacity: 0;
  }
  100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes cardZigzagFlow {
  0% {
    transform: translateX(-50px) scale(0.9);
    opacity: 0;
  }
  50% {
    transform: translateX(25px) scale(1.05);
    opacity: 0.7;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes cardLayeredDepth {
  0% {
    transform: translateZ(-100px) scale(0.8);
    opacity: 0;
  }
  100% {
    transform: translateZ(0) scale(1);
    opacity: 1;
  }
}

/* Animation Delay Classes */
.animation-delay-0 { animation-delay: 0ms; }
.animation-delay-80 { animation-delay: 80ms; }
.animation-delay-160 { animation-delay: 160ms; }
.animation-delay-240 { animation-delay: 240ms; }
.animation-delay-320 { animation-delay: 320ms; }
.animation-delay-400 { animation-delay: 400ms; }
.animation-delay-480 { animation-delay: 480ms; }
.animation-delay-500 { animation-delay: 500ms; }

/* Card Transition Out */
.card-transition-out {
  animation: cardTransitionOut 0.5s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
}

@keyframes cardTransitionOut {
  0% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
  100% {
    transform: scale(0.95) translateY(-10px);
    opacity: 0;
  }
}

/* Scrollbar styling for navigation */
.nav-panel::-webkit-scrollbar {
  width: 4px;
}

.nav-panel::-webkit-scrollbar-track {
  background: rgba(31, 41, 55, 0.5);
}

.nav-panel::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.8);
  border-radius: 2px;
}

.nav-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.9);
}

/* Mobile Navigation Adjustments */
@media (max-width: 640px) {
  .nav-panel {
    width: 100vw !important;
    max-width: 100vw !important;
  }

  .station-card {
    margin-bottom: 0.75rem;
  }

  .nav-header {
    padding: 1rem 1.5rem;
  }
}

/* Tablet Navigation Adjustments */
@media (min-width: 641px) and (max-width: 1024px) {
  .nav-panel {
    width: 350px;
  }
}

/* Desktop Navigation Enhancements */
@media (min-width: 1025px) {
  .nav-panel {
    width: 400px;
  }

  .station-card:hover {
    transform: translateX(-4px);
  }
}

/* Navigation Panel Blur Effect */
@supports (backdrop-filter: blur(20px)) {
  .nav-panel {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
}
</style>