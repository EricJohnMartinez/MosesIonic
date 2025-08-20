
<template>
  <IonContent class="relative" fullscreen>
    <!-- Pull to refresh -->
    <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
      <IonRefresherContent pulling-text="Pull to refresh" refreshing-spinner="lines" />
    </IonRefresher>
    <!-- Weather background image -->
    <div class="fixed inset-0 w-full h-full z-0" :style="bgStyle"></div>
    <!-- Overlay for readability -->
    <div class="fixed inset-0 w-full h-full z-10 pointer-events-none" style="background:rgba(0,0,0,0.25);"></div>
    <div class="relative z-20">
  <!-- Header Section -->
  <header class="sticky top-0 z-50 bg-white-900/80 backdrop-blur-lg">
  <div class="max-w-7xl mx-auto px-4 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="w-12 h-12 ">
          <img src="\public\images\logo.png" alt="">
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-white text-center -mt-1">Project GENESIS</h1>
          <p class="text-sm font-light text-white-400 -mt-3 text-center lp-1">Powered by MOSES</p>
        </div>
      </div>
      
      <div class="relative group">
        <div
          class="flex items-center space-x-2 px-4 py-2 rounded-full border border-gray-700 bg-gray-800 text-gray-200 transition-all duration-300 hover:border-blue-500 hover:text-white cursor-pointer"
        >
          
          <span class="font-medium">
            {{ stations.find(s => s.id === selectedStation)?.name || 'Select a Station' }}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 transform transition-transform duration-300 group-hover:rotate-180"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        
        <div class="absolute right-0 mt-2 w-full min-w-[160px] rounded-xl bg-gray-800 border border-gray-700 shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transform transition-all duration-300 origin-top-right">
          <ul class="py-2">
            <li
              v-for="station in stations"
              :key="station.id"
              @click="selectedStation = station.id"
              class="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors duration-200"
            >
              {{ station.name }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</header>

    <!-- Main Content -->
    <div class="relative z-10">
  <main class="max-w-7xl mx-auto px-4 py-6" v-if="currentStation">
        <!-- Current Weather Hero Section -->
        <section class="mb-8">
          <div class="  rounded-3xl p-8  ">
            <div class="flex flex-col lg:flex-row items-center justify-between">
              <!-- Main Weather Display -->
              <div class="text-center lg:text-left mb-6 lg:mb-0">
                <div class="flex items-center justify-center lg:justify-start space-x-4 mb-4">
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
                    <div class="text-2xl font-bold text-orange-700">{{ currentStation.data.heatIndex }}°</div>
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

      <!-- Weather Metrics Grid -->
       <div class="mt-6">
                <WindSpeedChart ref="windChartRef" :stationId="currentStation.id" />
              </div>
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-white-500 mb-6">Weather Metrics</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Temperature & Humidity -->
          <div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white-700">Temperature</h3>
              <span class="text-3xl">🌡️</span>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-white-600">Current</span>
                <span class="text-2xl font-bold text-white-500">{{ currentStation.data.temperature }}°C</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-white-600">Feels like</span>
                <span class="text-lg font-semibold text-orange-600">{{ currentStation.data.heatIndex }}°C</span>
              </div>
            </div>
          </div>

          <!-- Wind -->
            <!-- Wind -->
          <div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white-700">Wind</h3>
                <WindCompass :windDirection="currentStation.data.windAngle || 0" :windSpeed="currentStation.data.windSpeed || 0" />
            </div>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-white-600">Speed</span>
                <span class="text-2xl font-bold text-white-500">{{ currentStation.data.windSpeed }} m/s</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-white-600">Direction</span>
                <span class="text-lg font-semibold text-blue-600">{{ currentStation.data.windDirection }}</span>
              </div>
            </div>
          </div>

          <!-- Precipitation -->
          <div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white-700">Precipitation</h3>
              <span class="text-3xl">🌧️</span>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-white-600">Rainfall</span>
                <span class="text-2xl font-bold text-white-500">{{ currentStation.data.rainfall }} mm</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-white-600">Humidity</span>
                <span class="text-lg font-semibold text-blue-600">{{ currentStation.data.humidity }}%</span>
              </div>
            </div>
          </div>

          <!-- Atmospheric -->
          <div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white-700">Atmospheric</h3>
              <span class="text-3xl">🧪</span>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-white-600">Pressure</span>
                <span class="text-2xl font-bold text-white-500">{{ currentStation.data.pressure }} hPa</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-white-600">Solar</span>
                <span class="text-lg font-semibold text-yellow-600">{{ currentStation.data.solar }} W/m²</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Soil Monitoring Section -->
      <section class="mb-8">
        <h2 class="text-2xl font-bold text-white-500 mb-6">Soil Monitoring</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white-700">Soil Moisture</h3>
              <span class="text-3xl">🌱</span>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-green-600 mb-2">{{ currentStation.data.soilMoisture }}%</div>
              <div class="w-full bg-white-200 rounded-full h-3">
                <div 
                  class="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                  :style="{ width: currentStation.data.soilMoisture + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white-700">Soil Temperature</h3>
              <span class="text-3xl">🌡️</span>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-yellow-600 mb-2">{{ currentStation.data.soilTemp }}°C</div>
              <div class="text-sm text-white-600">Underground reading</div>
            </div>
          </div>

          <div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-white-700">Light Intensity</h3>
              <span class="text-3xl">💡</span>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-purple-600 mb-2">{{ currentStation.data.illumination }}</div>
              <div class="text-sm text-white-600">lux</div>
            </div>
          </div>
        </div>
      </section>

        <!-- Action Buttons -->
        <section class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <router-link 
            to="/summary" 
            class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
          >
            <span>📊</span>
            <span>View 7-Day Summary</span>
          </router-link>
          
          <button 
            v-if="currentStation.data.heatIndex > 35"
            @click="showAlert = true"
            class="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 animate-pulse"
          >
            <span>🚨</span>
            <span>Heat Alert Active</span>
          </button>
        </section>
      </main>
    </div>

    <!-- Heat Index Alert Modal -->
    <transition name="modal">
      <div v-if="showAlert" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-4 border-red-400 transform scale-100">
          <div class="text-center">
            <div class="text-8xl mb-4 animate-bounce">🔥</div>
            <h3 class="text-3xl font-bold text-red-700 mb-4">Heat Index Alert</h3>
            <div class="bg-red-50 rounded-2xl p-6 mb-6">
              <p class="text-lg text-red-800 mb-2">
                <strong>{{ currentStation?.data.heatIndex }}°C</strong> heat index detected!
              </p>
              <p class="text-red-700">
                High heat index at <strong>{{ currentStation?.name }}</strong>. 
                Please take necessary precautions and stay hydrated.
              </p>
            </div>
            <div class="space-y-3 text-left text-sm text-gray-600 mb-6">
              <div class="flex items-center space-x-2">
                <span>💧</span>
                <span>Drink plenty of water</span>
              </div>
              <div class="flex items-center space-x-2">
                <span>🏠</span>
                <span>Stay in air-conditioned areas</span>
              </div>
              <div class="flex items-center space-x-2">
                <span>☀️</span>
                <span>Avoid prolonged sun exposure</span>
              </div>
            </div>
            <button 
              @click="showAlert = false"
              class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Decorative Elements -->
    <div class="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-30">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
    </div>
    </div>
  </IonContent>
</template>

<script setup lang="ts">
import WindSpeedChart from '../components/WindSpeedChart.vue';
import { ref, computed, onMounted, watch } from 'vue';
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
const showAlert = ref(false);

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
  console.log('calculateHeatIndex called with:', { temperature: T, humidity: RH });
  
  if (typeof T !== 'number' || typeof RH !== 'number') {
    console.log('Invalid types - T:', typeof T, 'RH:', typeof RH);
    return 0;
  }
  
  if (T === 0 || RH === 0) {
    console.log('Zero values detected - T:', T, 'RH:', RH);
    return 0;
  }
  
  if (isNaN(T) || isNaN(RH)) {
    console.log('NaN values detected - T:', T, 'RH:', RH);
    return 0;
  }
  
  const T_F = (T * 9/5) + 32;
  const HI_F = -42.379 + 2.04901523 * T_F + 10.14333127 * RH - 0.22475541 * T_F * RH - 0.00683783 * T_F * T_F - 0.05481717 * RH * RH + 0.00122874 * T_F * T_F * RH + 0.00085282 * T_F * RH * RH - 0.00000199 * T_F * T_F * RH * RH;
  const result = parseFloat((((HI_F) - 32) * 5/9).toFixed(2)) || 0;
  
  console.log('Heat index calculation:', { T_F, HI_F, result });
  return result;
}

function fetchLatestSensors(stationId: string) {
  console.log('Fetching sensors for station:', stationId);
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
      
      console.log(`Sensor ${sensor.key} (${sensor.label}):`, finalValue, 'Raw value:', val);
    });
  });
}

onMounted(() => {
  fetchLatestSensors(selectedStation.value);
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
  console.log('Fetching latest sensors for station:', selectedStation.value);
  console.log('Current sensor values:', sensorValues.value);
});

// Pull-to-refresh handler
const handleRefresh = async (event: any) => {
  console.log('User triggered refresh');
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

let map: any = null;
const markerMap: { [key: string]: any } = {};

const currentStation = computed(() => {
  const station = stations.value.find((s) => s.id === selectedStation.value);
  if (!station) return null;
  
  // Calculate heat index from temperature and humidity only if both are valid and non-zero
  const temperature = sensorValues.value.TEM;
  const humidity = sensorValues.value.HUM;
  
  console.log('Current sensor values in computed:', {
    temperature,
    humidity,
    allSensorValues: sensorValues.value
  });
  
  let heatIndex = 0;
  if (
    typeof temperature === 'number' && typeof humidity === 'number' &&
    temperature !== 0 && humidity !== 0 &&
    !isNaN(temperature) && !isNaN(humidity)
  ) {
    heatIndex = calculateHeatIndex(temperature, humidity);
    console.log('Heat index calculated:', heatIndex);
  } else {
    console.log('Heat index calculation skipped due to invalid values:', {
      temperature,
      humidity,
      tempType: typeof temperature,
      humType: typeof humidity,
      tempIsZero: temperature === 0,
      humIsZero: humidity === 0,
      tempIsNaN: isNaN(temperature),
      humIsNaN: isNaN(humidity)
    });
  }
  
  console.log('Final current station data:', {
    temperature,
    humidity,
    heatIndex
  });
  
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
      console.log('ExtraMarkers not available, using default markers');
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
    </style>
