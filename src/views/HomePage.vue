<template>
  <IonContent class="relative min-h-screen flex items-center justify-center" fullscreen scrollEvents @ionScroll="handleIonScroll">
    <!-- Pull to refresh -->
    <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
      <IonRefresherContent pulling-text="Pull to refresh" refreshing-spinner="lines" />
    </IonRefresher>
    <!-- Weather background image -->
    <div class="fixed inset-0 w-full h-full z-0" :style="bgStyle"></div>
    <!-- Overlay for readability -->
    <div class="fixed inset-0 w-full h-full z-10 pointer-events-none" style="background:rgba(0,0,0,0.25);"></div>
  <div class="relative z-20 flex items-center justify-center">

      <!-- Main Content -->
      <div class="relative z-10">
        
  <!-- Station selector as left-aligned kebab (three-dots) button -->
  <div class="relative group absolute top-4 left-80 mt-50 z-50">
          <button
            type="button"
            aria-label="Stations"
            class="flex items-center justify-center w-10 h-10 rounded-full border border-gray-700 bg-gray-800 text-gray-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200">
            <!-- vertical three dots icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
            </svg>
          </button>

          <div
            class="absolute left-0 mt-2 min-w-[160px] rounded-xl bg-gray-800 border border-gray-700 shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transform transition-all duration-200 origin-top-left">
            <ul class="py-2">
              <li v-for="station in stations" :key="station.id" @click="selectedStation = station.id"
                class="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors duration-200">
                {{ station.name }}
              </li>
            </ul>
          </div>
        </div>
        <main class="max-w-7xl mx-auto px-4 py-6" v-if="currentStation">
          <!-- Current Weather Hero Section -->
          <div
            :class="['w-full flex items-center justify-center min-h-screen lg:min-h-[60vh] -mt-36 -mb-60 transition-all duration-700 ease-in-out', heroHidden ? 'opacity-0 -translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0']"
            :style="{ filter: heroHidden ? 'blur(6px) saturate(0.95)' : 'none', willChange: 'opacity, transform, filter' }">
            <section>
              <div class="w-full max-w-xl rounded-3xl p-8">
              <div class="flex flex-col lg:flex-row items-center justify-between">
                <!-- Main Weather Display -->
                <div class="text-center lg:text-right mb-6 lg:mb-0">
                  <div class="flex items-center justify-center lg:justify-end space-x-4 mb-4">
                    <div class="text-8xl animate-bounce">
                      {{ getWeatherIcon() }}
                    </div>
                    <div>
                      <div class="text-6xl font-bold text-white-500">
                        {{ currentStation.data.temperature }}°
                      </div>
                      <div class="text-xl text-white-500 font-medium">
                        {{ currentStation.name }}
                      </div>
                    </div>
                  </div>

                  <!-- Weather Description -->
                  <div class="text-lg text-white-700 mb-4">
                    {{ getWeatherDescription() }}
                  </div>

                  <!-- Quick Stats -->
                  <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto lg:mx-0">
                    <div class="bg-blue-100/60 rounded-xl p-3 text-center">
                      <div class="text-2xl font-bold text-blue-700">{{ currentStation.data.humidity }}%</div>
                      <div class="text-sm text-blue-600">Humidity</div>
                    </div>
                    <div class="bg-orange-100/60 rounded-xl p-3 text-center">
                      <div class="text-2xl font-bold text-orange-700">
                        {{ currentStation.data.heatIndex }}°</div>
                      <div class="text-sm text-orange-600">Heat Index</div>
                    </div>
                  </div>
                </div>
                <!-- Mini Map -->
                <div class="w-full lg:w-80 h-64 rounded-2xl overflow-hidden shadow-lg border border-white/20">
                  <div id="weather-map" class="w-full h-full"></div>
                </div>
              </div>
            </div>
            </section>
          </div>

          <!-- Weather Metrics Grid -->
          <transition name="fade">
            <div v-if="showWindChart" class="mt-6">
              <WindSpeedChart ref="windChartRef" :stationId="currentStation.id" />
            </div>
          </transition>
          <transition name="fade">
            <div v-if="showRainfallChart" class="mt-6">
              <RainfallChart ref="rainfallChartRef" :stationId="currentStation.id" />
            </div>
          </transition>
          <section class="mb-8">
            <h2 class="text-2xl font-bold text-white-500 mb-6">Weather Metrics</h2>
            <div id="metrics-grid" class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- Temperature & Humidity -->
              <div data-card-id="Temperature"
                :class="['bg-white/20 backdrop-blur-lg rounded-2xl p-3 shadow-md border border-white/20 card-hover card-transition', heroHidden ? 'card-dark' : '']">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-semibold text-white-700">Temperature</h3>
                  <span class="text-2xl">🌡️</span>
                </div>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-white-600">Current</span>
                    <span class="text-xl font-bold text-white-500">{{ currentStation.data.temperature }}°C</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-white-600">Feels like</span>
                    <span class="text-sm font-semibold text-orange-600">{{ currentStation.data.heatIndex }}°C</span>
                  </div>
                </div>
              </div>

              <!-- Wind -->
              <div data-card-id="Wind"
                :class="['bg-white/20 backdrop-blur-lg rounded-2xl p-3 shadow-md border border-white/20 cursor-pointer select-none card-hover card-transition', heroHidden ? 'card-dark' : '']"
                role="button" :aria-expanded="showWindChart" @click="toggleWindChart" @keydown.enter="toggleWindChart"
                @keydown.space.prevent="toggleWindChart">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-semibold text-white-700">Wind</h3>
                  <WindCompass :windDirection="currentStation.data.windAngle || 0"
                    :windSpeed="currentStation.data.windSpeed || 0" />
                </div>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-white-600">Speed</span>
                    <span class="text-xl font-bold text-white-500">{{ currentStation.data.windSpeed }} m/s</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-white-600">Direction</span>
                    <span class="text-sm font-semibold text-blue-600">{{ currentStation.data.windDirection }}</span>
                  </div>
                </div>
              </div>

              <!-- Precipitation -->
              <div data-card-id="Precipitation"
                :class="['bg-white/20 backdrop-blur-lg rounded-2xl p-3 shadow-md border border-white/20 cursor-pointer select-none card-hover card-transition', heroHidden ? 'card-dark' : '']"
                role="button" :aria-expanded="showRainfallChart" @click="toggleRainfallChart"
                @keydown.enter="toggleRainfallChart" @keydown.space.prevent="toggleRainfallChart">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-semibold text-white-700">Precipitation</h3>
                  <span class="text-2xl">🌧️</span>
                </div>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-white-600">Rainfall</span>
                    <span class="text-xl font-bold text-white-500">{{ currentStation.data.rainfall }} mm</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-white-600">Humidity</span>
                    <span class="text-sm font-semibold text-blue-600">{{ currentStation.data.humidity }}%</span>
                  </div>
                </div>
              </div>

              <!-- Atmospheric -->
              <div data-card-id="Atmospheric"
                :class="['bg-white/20 backdrop-blur-lg rounded-2xl p-3 shadow-md border border-white/20 card-hover card-transition', heroHidden ? 'card-dark' : '']">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-semibold text-white-700">Atmospheric</h3>
                  <span class="text-2xl">🧪</span>
                </div>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-white-600">Pressure</span>
                    <span class="text-xl font-bold text-white-500">{{ currentStation.data.pressure }} hPa</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-white-600">Solar</span>
                    <span class="text-sm font-semibold text-yellow-600">{{ currentStation.data.solar }} W/m²</span>
                  </div>
                </div>
              </div>
              <!-- Soil Moisture -->
              <div data-card-id="SoilMoisture"
                :class="['bg-white/20 backdrop-blur-lg rounded-2xl p-3 shadow-md border border-white/20 card-hover card-transition', heroHidden ? 'card-dark' : '']">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-semibold text-white-700">Soil Moisture</h3>
                  <span class="text-2xl">🌱</span>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600 mb-2">{{ currentStation.data.soilMoisture }}%</div>
                  <div class="w-full bg-white-200 rounded-full h-3">
                    <div
                      class="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                      :style="{ width: currentStation.data.soilMoisture + '%' }"></div>
                  </div>
                </div>
              </div>
              <!-- Soil Temperature -->
              <div data-card-id="SoilTemp"
                :class="['bg-white/20 backdrop-blur-lg rounded-2xl p-3 shadow-md border border-white/20 card-hover card-transition', heroHidden ? 'card-dark' : '']">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-semibold text-white-700">Soil Temperature</h3>
                  <span class="text-2xl">🌡️</span>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-yellow-600 mb-2">{{ currentStation.data.soilTemp }}°C</div>
                  <div class="text-sm text-white-600">Underground reading</div>
                </div>
              </div>
              <!-- Light Intensity -->
              <div data-card-id="LightIntensity"
                :class="['bg-white/20 backdrop-blur-lg rounded-2xl p-3 shadow-md border border-white/20 card-hover card-transition', heroHidden ? 'card-dark' : '']">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-semibold text-white-700">Light Intensity</h3>
                  <span class="text-2xl">💡</span>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-purple-600 mb-2">{{ currentStation.data.illumination }}</div>
                  <div class="text-sm text-white-600">lux</div>
                </div>
              </div>
            </div>
          </section>


          <!-- Action Buttons -->
          <section class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <router-link to="/summary"
              class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2">
              <span>📊</span>
              <span>View 7-Day Summary</span>
            </router-link>

    <button v-if="currentStation.data.heatIndex > 35" @click="openHeatAlert"
              class="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 animate-pulse">
              <span>🚨</span>
              <span>Heat Alert Active</span>
            </button>
          </section>
        </main>
      </div>
  <!-- Heat Alert handled by SweetAlert2 component -->
  <HeatAlert ref="heatAlertRef" />

      <!-- Decorative Elements -->
      <div class="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-30">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl">
        </div>
      </div>
    </div>
  </IonContent>
</template>

<script setup lang="ts">
import WindSpeedChart from '../components/WindSpeedChart.vue';
import RainfallChart from '../components/RainfallChart.vue';
import HeatAlert from '../components/HeatAlert.vue';
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import Sortable from 'sortablejs';
import { IonContent, IonRefresher, IonRefresherContent } from '@ionic/vue';
import WindCompass from '../components/WindCompass.vue';
import { db } from '../firebase';
import { ref as dbRef, query, orderByKey, limitToLast, onChildAdded } from 'firebase/database';

// @ts-ignore
declare global { interface Window { L: any } }

// Define stations
const stations = ref([
  { id: 'station1', name: 'MinSU Station', lat: 13.153925, lng: 121.185337 },
  { id: 'station2', name: 'San Andres Station', lat: 13.142357, lng: 121.156572 }
]);

const selectedStation = ref('station1');
// Heat alert component ref (SweetAlert2)
const heatAlertRef = ref<any>(null);
// Show/hide wind chart when clicking the Wind card
const showWindChart = ref(false);

function toggleWindChart() {
  showWindChart.value = !showWindChart.value;
  // If opening, try to refresh chart data from child component
  if (showWindChart.value) {
    try {
      const child: any = windChartRef.value;
      if (child && typeof child.fetchWindSpeedData === 'function') {
        child.fetchWindSpeedData(selectedStation.value);
      }
    } catch (e) {
      console.warn('Failed to refresh wind chart on toggle', e);
    }
  }
}
// Show/hide rainfall chart (same logic as wind)
const showRainfallChart = ref(false);
const rainfallChartRef = ref(null);
function toggleRainfallChart() {
  showRainfallChart.value = !showRainfallChart.value;
  if (showRainfallChart.value) {
    try {
      const child: any = rainfallChartRef.value;
      if (child && typeof child.fetchRainfallData === 'function') {
        child.fetchRainfallData(selectedStation.value);
      }
    } catch (e) {
      console.warn('Failed to refresh rainfall chart on toggle', e);
    }
  }
}

function openHeatAlert() {
  try {
    const refComp: any = heatAlertRef.value;
    if (refComp && typeof refComp.showHeat === 'function' && currentStation.value) {
      refComp.showHeat({ station: currentStation.value.name, heatIndex: currentStation.value.data.heatIndex });
    }
  } catch (e) {
    console.warn('Failed to open heat alert', e);
  }
}

// Fade-out-when-scroll-up behavior for hero
const heroHidden = ref(false);
let lastScroll = 0;
function onScroll() {
  const y = window.scrollY || document.documentElement.scrollTop;
  // if scrolled down (y increased) hide hero, if scrolled up show
  if (y > lastScroll && y > 30) {
    heroHidden.value = true;
  } else if (y < lastScroll) {
    heroHidden.value = false;
  }
  lastScroll = y;
}

// Ionic IonContent scroll handler (preferred inside Ionic apps)
function handleIonScroll(ev: any) {
  const y = ev?.detail?.scrollTop ?? 0;
  if (y > lastScroll && y > 30) heroHidden.value = true;
  else if (y < lastScroll) heroHidden.value = false;
  lastScroll = y;
}
// Sensor types and mapping
const sensorTypes = [
  { key: 'TEM', label: 'temperature' },
  { key: 'HUM', label: 'humidity' },
  { key: 'RR', label: 'rainfall' },
  { key: 'WSP', label: 'windSpeed' },
  { key: 'WD', label: 'windDirection' },
  { key: 'SMD', label: 'soilMoisture' },
  { key: 'STD', label: 'soilTemp' },
  { key: 'LUX', label: 'illumination' },
  { key: 'TSR', label: 'solar' },
  { key: 'WA', label: 'windAngle' },
  { key: 'ATM', label: 'pressure' }
];

const sensorValues = ref({
  TEM: 0,
  HUM: 0,
  RR: 0,
  WSP: 0,
  WD: '',
  SMD: 0,
  STD: 0,
  LUX: 0,
  TSR: 0,
  WA: 0,
  ATM: 0
});

// Helper functions for weather display



function getWeatherIcon(): string {
  if (!currentStation.value) return '⛅';

  const { heatIndex, rainfall, temperature } = currentStation.value.data;

  if (heatIndex > 35) return '🔥';
  if (rainfall > 5) return '🌧️';
  if (temperature > 32) return '☀️';
  if (temperature > 25) return '🌤️';
  if (temperature > 20) return '⛅';
  return '🌫️';
}

function getWeatherDescription(): string {
  if (!currentStation.value) return 'Loading weather data...';

  const { heatIndex, rainfall, temperature, humidity } = currentStation.value.data;

  if (heatIndex > 35) return 'Extremely hot - Heat index warning in effect';
  if (rainfall > 10) return 'Heavy rainfall - Stay indoors if possible';
  if (rainfall > 5) return 'Moderate rainfall - Carry an umbrella';
  if (temperature > 32) return 'Very hot and sunny - Stay hydrated';
  if (temperature > 28) return 'Warm and pleasant weather';
  if (temperature > 20) return 'Comfortable temperature';
  if (humidity > 80) return 'High humidity - May feel muggy';
  return 'Pleasant weather conditions';
}

// Helper to compute heat index (Celsius)
function calculateHeatIndex(T: number, RH: number): number {
  if (typeof T !== 'number' || typeof RH !== 'number') {
    return 0;
  }

  if (T === 0 || RH === 0) {
    return 0;
  }

  if (isNaN(T) || isNaN(RH)) {
    return 0;
  }

  const T_F = (T * 9 / 5) + 32;
  const HI_F = -42.379 + 2.04901523 * T_F + 10.14333127 * RH - 0.22475541 * T_F * RH - 0.00683783 * T_F * T_F - 0.05481717 * RH * RH + 0.00122874 * T_F * T_F * RH + 0.00085282 * T_F * RH * RH - 0.00000199 * T_F * T_F * RH * RH;
  const result = parseFloat((((HI_F) - 32) * 5 / 9).toFixed(2)) || 0;

  // heat index computed
  return result;
}

function fetchLatestSensors(stationId: string) {
  sensorTypes.forEach(sensor => {
    const sensorRef = dbRef(db, `${stationId}/data/sensors/${sensor.key}`);
    const q = query(sensorRef, orderByKey(), limitToLast(1));
    onChildAdded(q, (snapshot) => {
      const val = snapshot.val();
      let finalValue: any = val?.val ?? val ?? 0;

      // Convert string numbers to actual numbers for numeric sensors
      if (sensor.key !== 'WD' && typeof finalValue === 'string') {
        finalValue = parseFloat(finalValue) || 0;
      }

      // Type-safe assignment
      if (sensor.key === 'TEM') sensorValues.value.TEM = finalValue;
      else if (sensor.key === 'HUM') sensorValues.value.HUM = finalValue;
      else if (sensor.key === 'RR') sensorValues.value.RR = finalValue;
      else if (sensor.key === 'WSP') sensorValues.value.WSP = finalValue;
      else if (sensor.key === 'WD') sensorValues.value.WD = finalValue;
      else if (sensor.key === 'SMD') sensorValues.value.SMD = finalValue;
      else if (sensor.key === 'STD') sensorValues.value.STD = finalValue;
      else if (sensor.key === 'LUX') sensorValues.value.LUX = finalValue;
      else if (sensor.key === 'TSR') sensorValues.value.TSR = finalValue;
      else if (sensor.key === 'WA') sensorValues.value.WA = finalValue;
      else if (sensor.key === 'ATM') sensorValues.value.ATM = finalValue;

      // sensor value updated for key
    });
  });
}

onMounted(() => {
  fetchLatestSensors(selectedStation.value);
});

onUnmounted(() => {
  // no-op: using IonContent scroll events
});

watch(selectedStation, (newStation) => {
  // Reset values
  sensorValues.value.TEM = 0;
  sensorValues.value.HUM = 0;
  sensorValues.value.RR = 0;
  sensorValues.value.WSP = 0;
  sensorValues.value.WD = '';
  sensorValues.value.SMD = 0;
  sensorValues.value.STD = 0;
  sensorValues.value.LUX = 0;
  sensorValues.value.TSR = 0;
  sensorValues.value.WA = 0;
  sensorValues.value.ATM = 0;

  fetchLatestSensors(newStation);
  // fetching latest sensors for station
  // current sensor values updated
});

// Pull-to-refresh handler
const handleRefresh = async (event: any) => {
  // user triggered refresh
  try {
    // Refresh latest sensor values for the currently selected station
    fetchLatestSensors(selectedStation.value);

    // Refresh child chart if available
    try {
      const child: any = windChartRef.value;
      if (child && typeof child.fetchWindSpeedData === 'function') {
        child.fetchWindSpeedData(selectedStation.value);
      }
    } catch (e) {
      console.warn('Wind chart refresh failed or not available yet', e);
    }

    // Optional: re-center the map to the selected station after refresh
    if (map && currentStation.value) {
      const st = stations.value.find(s => s.id === selectedStation.value);
      if (st) {
        map.setView([st.lat, st.lng], 12);
      }
    }

    // Small delay to allow async updates to propagate (adjustable)
    await new Promise((resolve) => setTimeout(resolve, 700));
  } catch (err) {
    console.error('Error during pull-to-refresh:', err);
  } finally {
    // Signal Ionic the refresh is complete so it can close the refresher UI
    try { event.target.complete(); } catch (e) { /* ignore */ }
  }
};

// Template ref for the wind chart component
const windChartRef = ref(null);

// SortableJS: robust drag + touch support for card reordering
let sortableInstance: any = null;

function saveCardOrder() {
  try {
    const container = document.querySelector('.grid.grid-cols-1');
    if (!container) return;
    const ids = Array.from(container.children).map((c: any) => c.getAttribute('data-card-id') || c.querySelector('h3')?.textContent || 'card');
    localStorage.setItem('dashboard.cardOrder', JSON.stringify(ids));
  } catch (e) { /* ignore */ }
}

function restoreCardOrder() {
  try {
    const raw = localStorage.getItem('dashboard.cardOrder');
    if (!raw) return;
    const order: string[] = JSON.parse(raw);
    const container = document.querySelector('.grid.grid-cols-1');
    if (!container) return;
    order.forEach((key) => {
      const match = Array.from(container.children).find((c: any) => (c.getAttribute('data-card-id') || c.querySelector('h3')?.textContent || '').trim() === key.trim());
      if (match) container.appendChild(match);
    });
  } catch (e) { /* ignore */ }
}

let map: any = null;
const markerMap: { [key: string]: any } = {};

const currentStation = computed(() => {
  const station = stations.value.find((s) => s.id === selectedStation.value);
  if (!station) return null;

  // Calculate heat index from temperature and humidity only if both are valid and non-zero
  const temperature = sensorValues.value.TEM;
  const humidity = sensorValues.value.HUM;

  // current sensor values in computed are available

  let heatIndex = 0;
  if (
    typeof temperature === 'number' && typeof humidity === 'number' &&
    temperature !== 0 && humidity !== 0 &&
    !isNaN(temperature) && !isNaN(humidity)
  ) {
    heatIndex = calculateHeatIndex(temperature, humidity);
    // heat index calculated
  } else {
    // heat index calculation skipped due to invalid values
  }

  // final current station data prepared

  return {
    ...station,
    data: {
      temperature,
      humidity,
      rainfall: sensorValues.value.RR,
      windSpeed: sensorValues.value.WSP,
      windDirection: sensorValues.value.WD,
      heatIndex,
      soilMoisture: sensorValues.value.SMD,
      soilTemp: sensorValues.value.STD,
      illumination: sensorValues.value.LUX,
      solar: sensorValues.value.TSR,
      windAngle: sensorValues.value.WA,
      pressure: sensorValues.value.ATM
    }
  };
});

// Compute background image style based on current weather and time of day
const bgStyle = computed(() => {
  const data = currentStation.value?.data;
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 18;

  // Safe defaults
  const temperature = data?.temperature ?? 0;
  const humidity = data?.humidity ?? 0;
  const rainfall = data?.rainfall ?? 0;
  const heatIndex = data?.heatIndex ?? 0;

  let img = '/images/sunny-bg.jpg';

  if (rainfall > 10) img = '/images/rainy-bg.jpg';
  else if (rainfall > 5) img = '/images/rainy-bg.jpg';
  else if (heatIndex > 35) img = '/images/sunny-bg.jpg';
  else if (temperature > 32) img = '/images/sunny-bg.jpg';
  else if (temperature > 25) img = '/images/cloudy-bg.jpg';
  else if (humidity > 80) img = '/images/cloudy-bg.jpg';
  else if (isNight) img = '/images/night-bg.jpg';

  return {
    backgroundImage: `url(${img})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  } as Record<string, string>;
});

onMounted(async () => {
  if (window.L) {
    try {
      // Dynamically import ExtraMarkers JS
      await import('leaflet-extra-markers/dist/js/leaflet.extra-markers.min.js');
    } catch (error) {
      // ExtraMarkers not available, using default markers
    }

    // Center of Mindoro: approx 13.2, 121.1, zoom 9 covers the whole island
    map = window.L.map('weather-map').setView([13.2, 121.1], 9);
    window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '  '
    }).addTo(map);

    const svgIconUrl = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><circle cx='12' cy='9' r='2.5' fill='%230a37fd' fill-opacity='0'><animate fill='freeze' attributeName='fill-opacity' begin='0.935s' dur='0.165s' values='0;1'/></circle><path fill='%230a37fd' fill-opacity='0' stroke='%230a37fd' stroke-dasharray='48' stroke-dashoffset='48' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.2' d='M12 20.5c0 0 -6 -7 -6 -11.5c0 -3.31 2.69 -6 6 -6c3.31 0 6 2.69 6 6c0 4.5 -6 11.5 -6 11.5Z'><animate fill='freeze' attributeName='fill-opacity' begin='0.77s' dur='0.165s' values='0;0.15'/><animate fill='freeze' attributeName='stroke-dashoffset' dur='0.66s' values='48;0'/><animateTransform attributeName='transform' dur='3.3s' keyTimes='0;0.3;0.4;0.54;0.6;0.68;0.7;1' repeatCount='indefinite' type='rotate' values='0 12 20.5;0 12 20.5;-8 12 20.5;0 12 20.5;5 12 20.5;-2 12 20.5;0 12 20.5;0 12 20.5'/></path></svg>";

    stations.value.forEach((station) => {
      const icon = window.L.icon({
        iconUrl: svgIconUrl,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      });
      const marker = window.L.marker([station.lat, station.lng], { icon }).addTo(map)
        .bindPopup(station.name);
      marker.on('click', () => {
        selectedStation.value = station.id;
      });
      markerMap[station.id] = marker;
    });

    // Open popup for the initially selected station
    if (currentStation.value && markerMap[currentStation.value.id]) {
      markerMap[currentStation.value.id].openPopup();
    }
  }

  // Initialize SortableJS on the metrics grid for drag/reorder with persistence
  try {
    const grid = document.getElementById('metrics-grid');
    if (grid) {
      // @ts-ignore - Sortable types not installed
      sortableInstance = Sortable.create(grid as any, {
        animation: 150,
        handle: '.card-hover',
        draggable: '.card-hover',
        fallbackOnBody: true,
        touchStartThreshold: 5,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onStart: (evt: any) => {
          try { (evt.item as HTMLElement).classList.add('dragging'); } catch (e) { }
        },
        onEnd: () => {
          // remove transient classes and save
          document.querySelectorAll('.dragging').forEach(n => n.classList.remove('dragging'));
          saveCardOrder();
        }
      });
      // restore previous order if any
      restoreCardOrder();
    }
  } catch (e) {
    // ignore
  }
});

// Open popup for selected station and center map
watch(selectedStation, (newId) => {
  if (map && window.L) {
    const station = stations.value.find(s => s.id === newId);
    if (station) {
      map.setView([station.lat, station.lng], 12);
      if (markerMap && markerMap[station.id]) {
        markerMap[station.id].openPopup();
      }
    }
  }
});
</script>

<style scoped>
/* Fix scrolling issues */
.min-h-screen {
  min-height: 100vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* Modern animations */
@keyframes modal {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-enter-active {
  animation: modal 0.3s ease-out;
}

.modal-leave-active {
  animation: modal 0.3s ease-in reverse;
}

/* Glassmorphism effects */
.backdrop-blur-lg {
  backdrop-filter: blur(16px);
}

.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Smooth transitions */
* {
  transition: all 0.3s ease;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.5);
}

/* Enhanced hover effects */
.transform:hover {
  transform: translateY(-2px);
}

/* Ensure station selector works properly */
ion-select {
  --background: white;
  --border-radius: 12px;
  --border-width: 1px;
  --border-color: #e5e7eb;
  --box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 44px;
}

/* Fix mobile scrolling and touch */
@media (max-width: 768px) {
  .min-h-screen {
    min-height: 100vh;
    height: auto;
    overflow-x: hidden;
    overflow-y: auto;
  }

  /* Prevent horizontal scroll */
  body {
    overflow-x: hidden;
  }
}

/* Animation delays for staggered effects */
.animate-delay-100 {
  animation-delay: 0.1s;
}

.animate-delay-200 {
  animation-delay: 0.2s;
}

.animate-delay-300 {
  animation-delay: 0.3s;
}

/* Progressive enhancement for better performance */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Fade transition for WindSpeedChart toggle */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* Card hover / focus lift effect */
.card-hover {
  transition: transform 180ms cubic-bezier(.2, .8, .2, 1), box-shadow 180ms cubic-bezier(.2, .8, .2, 1), border-color 180ms;
  will-change: transform, box-shadow;
}

.card-hover:hover,
.card-hover:focus {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.35);
  outline: none;
}

.card-hover:active {
  transform: translateY(-2px) scale(1.005);
}

.card-hover:focus-visible {
  box-shadow: 0 8px 22px rgba(59, 130, 246, 0.18), 0 2px 6px rgba(0, 0, 0, 0.08);
  border-color: rgba(59, 130, 246, 0.4);
}

/* Drag & drop visual states */
.card-hover.dragging {
  opacity: 0.85;
  transform: translateY(-8px) scale(1.01) !important;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.45) !important;
  transition: transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease;
  z-index: 60;
  pointer-events: none;
}

.card-hover.drag-over {
  outline: 2px dashed rgba(99, 102, 241, 0.22);
  outline-offset: 6px;
}

.sortable-ghost {
  opacity: 0.6 !important;
  transform: scale(0.995) !important;
  filter: blur(0.2px);
}

.sortable-chosen {
  box-shadow: 0 20px 48px rgba(2, 6, 23, 0.45) !important;
  z-index: 80;
}

/* Smooth card state transition for dark mode toggle */
.card-transition {
  transition-property: background-color, color, box-shadow, border-color, transform, filter;
  transition-duration: 700ms;
  transition-timing-function: cubic-bezier(.22,.9,.32,1);
  will-change: background-color, color, box-shadow, filter, transform;
}
</style>
<style scoped>
/* Dark card variant for hero/metrics */
.card-dark {
  background: rgba(8, 10, 15, 0.55) !important;
  border-color: rgba(255,255,255,0.06) !important;
  box-shadow: 0 12px 30px rgba(2,6,23,0.6) !important;
  color: #e6eef8 !important;
  backdrop-filter: blur(10px) saturate(1.05) !important;
}
.card-dark h3 {
  color: #e6eef8 !important;
}
.card-dark span, .card-dark .text-white-600, .card-dark .text-white-500 {
  color: rgba(230,238,248,0.95) !important;
}
.card-dark .text-sm { color: rgba(200,210,220,0.8) !important; }
.card-dark .text-2xl { color: #9fb7ff !important; }
.card-dark .text-orange-600 { color: #ffb37a !important; }
</style>
