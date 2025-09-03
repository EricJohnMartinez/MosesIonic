<template>
  <IonContent class="ion-no-padding" fullscreen scrollEvents @ionScroll="handleIonScroll">
    <!-- Pull to refresh -->
    <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
      <IonRefresherContent pulling-text="Pull to refresh" refreshing-spinner="lines" />
    </IonRefresher>
    <div class="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div class="relative z-20 flex-1 overflow-y-auto"
           :style="{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }">

        <!-- Main Content -->
        <div class="relative z-10">

          <!-- Station selector - positioned responsively -->
          <div class="fixed top-4 right-4 z-50 group"
               :style="{ top: 'calc(env(safe-area-inset-top) + 1rem)' }">
            <button type="button" aria-label="Stations"
              class="flex items-center justify-center w-12 h-12 md:w-10 md:h-10 rounded-full border border-gray-700 bg-gray-800/90 backdrop-blur-sm text-gray-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 touch-manipulation">
              <!-- vertical three dots icon -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor"
                aria-hidden="true">
                <path
                  d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
              </svg>
            </button>

            <div
              class="absolute right-0 mt-2 min-w-[180px] max-w-[280px] rounded-xl bg-gray-800/95 backdrop-blur-md border border-gray-700 shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transform transition-all duration-200 origin-top-right">
              <ul class="py-2">
                <li v-for="station in stations" :key="station.id" @click="selectedStation = station.id"
                  class="px-4 py-3 text-sm md:text-xs text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors duration-200 touch-manipulation">
                  {{ station.name }}
                </li>
              </ul>
            </div>
          </div>
        <main class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" v-if="currentStation">
          <!-- Current Weather Hero Section -->
          <div
            :class="['w-full flex items-center justify-center min-h-[60vh] sm:min-h-[50vh] md:min-h-[45vh] lg:min-h-[40vh] -mt-4 sm:-mt-6 md:-mt-8 lg:-mt-12 -mb-8 sm:-mb-12 md:-mb-16 lg:-mb-20 transition-all duration-700 ease-in-out', heroHidden ? 'opacity-0 -translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0']"
            :style="{ filter: heroHidden ? 'blur(6px) saturate(0.95)' : 'none', willChange: 'opacity, transform, filter' }">
            <section class="w-full">
              <div class="w-full max-w-5xl mx-auto rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8">
                <div class="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-8">
                  <!-- Main Weather Display -->
                  <div class="text-center lg:text-left mb-4 lg:mb-0 flex-1">
                    <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 mb-3">
                      <div class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl animate-bounce">
                        {{ getWeatherIcon() }}
                      </div>
                      <div class="text-center sm:text-left">
                        <div class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">
                          {{ currentStation.data.temperature }}°
                        </div>
                        <div class="text-base sm:text-lg md:text-xl text-white font-medium mt-1">
                          {{ currentStation.name }}
                        </div>
                      </div>
                    </div>

                    <!-- Weather Description -->
                    <div class="text-sm sm:text-base md:text-lg text-white/90 mb-3 max-w-md mx-auto lg:mx-0">
                      {{ getWeatherDescription() }}
                    </div>

                    <!-- Quick Stats -->
                    <div class="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 max-w-xs sm:max-w-sm mx-auto lg:mx-0">
                      <div class="bg-slate-800/80 backdrop-blur-sm rounded-xl p-2 sm:p-3 text-center border border-slate-700/50">
                        <div class="text-lg sm:text-xl md:text-2xl font-bold text-blue-400">{{ currentStation.data.humidity }}%</div>
                        <div class="text-xs sm:text-sm text-blue-300">Humidity</div>
                      </div>
                      <div class="bg-slate-800/80 backdrop-blur-sm rounded-xl p-2 sm:p-3 text-center border border-slate-700/50">
                        <div class="text-lg sm:text-xl md:text-2xl font-bold text-orange-400">
                          {{ currentStation.data.heatIndex }}°</div>
                        <div class="text-xs sm:text-sm text-orange-300">Heat Index</div>
                      </div>
                    </div>
                  </div>
                  <!-- Mini Map -->
                  <div class="w-full sm:w-72 md:w-80 lg:w-80 h-40 sm:h-48 md:h-56 lg:h-64 rounded-2xl overflow-hidden shadow-lg border border-slate-700/50 flex-shrink-0">
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
          <section class="mb-6 md:mb-8">
            <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 md:mb-6 mt-4 sm:mt-6 md:mt-10 text-center lg:text-left">Weather Metrics</h2>
            <div id="metrics-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-4 lg:gap-6 max-w-6xl mx-auto">
              <!-- Temperature & Humidity -->
                   <!-- Enhanced Rainfall Card -->
              <div data-card-id="RainfallIntensity"
                :class="['bg-slate-800/60 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-3 shadow-md border border-slate-700/50 card-hover card-transition touch-manipulation col-span-2 sm:col-span-2 md:col-span-3', heroHidden ? 'card-dark' : '']">
                <div class="flex items-center justify-between mb-3 md:mb-4">
                  <h3 class="text-sm font-semibold text-white">Rainfall Intensity & Warnings</h3>
                  <img src="/images/rainfall.png" class="w-8 h-8 md:w-10 md:h-10 object-contain" alt="Rainfall" />
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <!-- Rainfall Icon and Current Reading -->
                  <div class="flex items-center justify-center sm:col-span-1">
                    <div class="text-center">
                      <div class="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1">
                        {{ currentStation.data.rainfall }}<span class="text-sm md:text-base">mm</span>
                      </div>
                      <div class="text-xs md:text-sm text-white/80">Current Intensity</div>
                    </div>
                  </div>
                  
                  <!-- Rainfall Details -->
                  <div class="sm:col-span-2 space-y-3">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <p class="text-xs md:text-sm text-white/80">Daily Total</p>
                        <h1 class="text-xl md:text-lg font-bold text-white">{{ todayTotalRain.toFixed(2) }} mm</h1>
                      </div>
                      <div>
                        <p class="text-xs md:text-sm text-white/80">Category</p>
                        <h1 class="text-xl md:text-lg text-white font-semibold">{{ getRainfallCategory() }}</h1>
                      </div>
                    </div>
                    
                    <!-- Rainfall Warning Levels -->
                    <div class="space-y-2">
                      <p class="text-xs text-white/80">Warning Levels</p>
                      <div class="flex gap-1">
                        <!-- Yellow Warning -->
                        <div 
                          :class="todayTotalRain >= 50.0 && todayTotalRain <= 100.0 ? 'w-full bg-yellow-500 transition-all duration-300' : 'bg-gray-600/50 w-8'"
                          class="h-4 flex items-center justify-center rounded-l-lg rounded-r-sm relative">
                          <p 
                            :class="todayTotalRain >= 50.0 && todayTotalRain <= 100.0 ? 'text-white text-[10px] md:text-xs opacity-100' : 'hidden'"
                            class="absolute inset-0 flex items-center justify-center font-bold">
                            YELLOW (50-100mm)
                          </p>
                        </div>
                        
                        <!-- Orange Warning -->
                        <div 
                          :class="todayTotalRain >= 101.0 && todayTotalRain <= 200.0 ? 'w-full bg-orange-600 transition-all duration-300' : 'bg-gray-600/50 w-8'"
                          class="h-4 flex items-center justify-center rounded-sm relative">
                          <p 
                            :class="todayTotalRain >= 101.0 && todayTotalRain <= 200.0 ? 'text-white text-[10px] md:text-xs opacity-100' : 'hidden'"
                            class="absolute inset-0 flex items-center justify-center font-bold">
                            ORANGE (101-200mm)
                          </p>
                        </div>
                        
                        <!-- Red Warning -->
                        <div 
                          :class="todayTotalRain >= 201.0 ? 'w-full bg-red-700 transition-all duration-300' : 'bg-gray-600/50 w-8'"
                          class="h-4 flex items-center justify-center rounded-r-lg rounded-l-sm relative">
                          <p 
                            :class="todayTotalRain >= 201.0 ? 'text-white text-[10px] md:text-xs opacity-100' : 'hidden'"
                            class="absolute inset-0 flex items-center justify-center font-bold">
                            RED (201mm+)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div data-card-id="Temperature"
                :class="['bg-slate-800/60 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-3 shadow-md border border-slate-700/50 card-hover card-transition touch-manipulation', heroHidden ? 'card-dark' : '']">
                <div class="flex items-center justify-between mb-3 md:mb-4">
                  <h3 class="text-sm font-semibold text-white">Temperature</h3>
                  <span class="text-xl md:text-2xl">🌡️</span>
                </div>
                <div class="space-y-2 md:space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-white/80 text-xs md:text-sm">Current</span>
                    <span class="text-base md:text-lg lg:text-xl font-bold text-white">{{ currentStation.data.temperature }}°C</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-white/80 text-xs md:text-sm">Feels like</span>
                    <span class="text-xs md:text-sm font-semibold text-orange-400">{{ currentStation.data.heatIndex }}°C</span>
                  </div>
                </div>
              </div>

              <!-- Wind -->
              <div data-card-id="Wind"
                :class="['bg-slate-800/60 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-3 shadow-md border border-slate-700/50 cursor-pointer select-none card-hover card-transition touch-manipulation', heroHidden ? 'card-dark' : '']"
                role="button" :aria-expanded="showWindChart" @click="toggleWindChart" @keydown.enter="toggleWindChart"
                @keydown.space.prevent="toggleWindChart">
                <div class="flex items-center justify-between mb-3 md:mb-4">
                  <h3 class="text-sm font-semibold text-white">Wind</h3>
                  <WindCompass :windDirection="currentStation.data.windAngle || 0"
                    :windSpeed="currentStation.data.windSpeed || 0" />
                </div>
                <div class="space-y-2 md:space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-white/80 text-xs md:text-sm">Speed</span>
                    <span class="text-base md:text-lg lg:text-xl font-bold text-white">{{ currentStation.data.windSpeed }} m/s</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-white/80 text-xs md:text-sm">Direction</span>
                    <span class="text-xs md:text-sm font-semibold text-blue-400">{{ currentStation.data.windDirection }}</span>
                  </div>
                </div>
              </div>

              <!-- Precipitation -->
              <div data-card-id="Precipitation"
                :class="['bg-slate-800/60 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-3 shadow-md border border-slate-700/50 cursor-pointer select-none card-hover card-transition touch-manipulation', heroHidden ? 'card-dark' : '']"
                role="button" :aria-expanded="showRainfallChart" @click="toggleRainfallChart"
                @keydown.enter="toggleRainfallChart" @keydown.space.prevent="toggleRainfallChart">
                <div class="flex items-center justify-between mb-3 md:mb-4">
                  <h3 class="text-sm font-semibold text-white">Precipitation</h3>
                  <span class="text-xl md:text-2xl">🌧️</span>
                </div>
                <div class="space-y-2 md:space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-white/80 text-xs md:text-sm">Rainfall</span>
                    <span class="text-base md:text-lg lg:text-xl font-bold text-white">{{ currentStation.data.rainfall }} mm</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-white/80 text-xs md:text-sm">Humidity</span>
                    <span class="text-xs md:text-sm font-semibold text-blue-400">{{ currentStation.data.humidity }}%</span>
                  </div>
                </div>
              </div>

          

              <!-- Atmospheric -->
              <div data-card-id="Atmospheric"
                :class="['bg-slate-800/60 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-3 shadow-md border border-slate-700/50 card-hover card-transition touch-manipulation', heroHidden ? 'card-dark' : '']">
                <div class="flex items-center justify-between mb-3 md:mb-4">
                  <h3 class="text-sm font-semibold text-white">Atmospheric</h3>
                  <span class="text-xl md:text-2xl">🧪</span>
                </div>
                <div class="space-y-2 md:space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-white/80 text-xs md:text-sm">Pressure</span>
                    <span class="text-base md:text-lg lg:text-xl font-bold text-white">{{ currentStation.data.pressure }} hPa</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-white/80 text-xs md:text-sm">Solar</span>
                    <span class="text-xs md:text-sm font-semibold text-yellow-400">{{ currentStation.data.solar }} W/m²</span>
                  </div>
                </div>
              </div>
              <!-- Soil Moisture -->
              <div data-card-id="SoilMoisture"
                :class="['bg-slate-800/60 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-3 shadow-md border border-slate-700/50 card-hover card-transition touch-manipulation', heroHidden ? 'card-dark' : '']">
                <div class="flex items-center justify-between mb-3 md:mb-4">
                  <h3 class="text-sm font-semibold text-white">Soil Moisture</h3>
                  <span class="text-xl md:text-2xl">🌱</span>
                </div>
                <div class="text-center">
                  <div class="text-lg md:text-xl lg:text-2xl font-bold text-green-400 mb-2">{{ currentStation.data.soilMoisture }}%</div>
                  <div class="w-full bg-slate-700/50 rounded-full h-2 md:h-3">
                    <div
                      class="bg-gradient-to-r from-green-400 to-green-600 h-2 md:h-3 rounded-full transition-all duration-500"
                      :style="{ width: currentStation.data.soilMoisture + '%' }"></div>
                  </div>
                </div>
              </div>
              <!-- Soil Temperature -->
              <div data-card-id="SoilTemp"
                :class="['bg-slate-800/60 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-3 shadow-md border border-slate-700/50 card-hover card-transition touch-manipulation', heroHidden ? 'card-dark' : '']">
                <div class="flex items-center justify-between mb-3 md:mb-4">
                  <h3 class="text-sm font-semibold text-white">Soil Temperature</h3>
                  <span class="text-xl md:text-2xl">🌡️</span>
                </div>
                <div class="text-center">
                  <div class="text-lg md:text-xl lg:text-2xl font-bold text-yellow-400 mb-2">{{ currentStation.data.soilTemp }}°C</div>
                  <div class="text-xs md:text-sm text-white/80">Underground reading</div>
                </div>
              </div>
              <!-- Light Intensity -->
              <div data-card-id="LightIntensity"
                :class="['bg-slate-800/60 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-3 shadow-md border border-slate-700/50 card-hover card-transition touch-manipulation', heroHidden ? 'card-dark' : '']">
                <div class="flex items-center justify-between mb-3 md:mb-4">
                  <h3 class="text-sm font-semibold text-white">Light Intensity</h3>
                  <span class="text-xl md:text-2xl">💡</span>
                </div>
                <div class="text-center">
                  <div class="text-lg md:text-xl lg:text-2xl font-bold text-purple-400 mb-2">{{ currentStation.data.illumination }}</div>
                  <div class="text-xs md:text-sm text-white/80">lux</div>
                </div>
              </div>
            </div>
          </section>


          <!-- Action Buttons -->
          <section class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 px-4">
            <router-link to="/summary"
              class="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 sm:px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 touch-manipulation min-h-[44px]">
              <span>📊</span>
              <span>View 7-Day Summary</span>
            </router-link>

            <button v-if="currentStation.data.heatIndex > 35" @click="openHeatAlert"
              class="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 text-white px-6 sm:px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 animate-pulse touch-manipulation min-h-[44px]">
              <span>🚨</span>
              <span>Heat Alert Active</span>
            </button>
          </section>
        </main>
        </div>
        
        <!-- Heat Alert handled by SweetAlert2 component -->
        <HeatAlert ref="heatAlertRef" />
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
import { ref as dbRef, query, orderByKey, limitToLast, onChildAdded, onValue, startAt } from 'firebase/database';

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
      else if (sensor.key === 'RR') {
        sensorValues.value.RR = finalValue;
        console.log('Rainfall data received:', finalValue);
      }
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
  fetchTodayRainfallTotal(selectedStation.value);
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
  fetchTodayRainfallTotal(newStation);
  // fetching latest sensors for station
  // current sensor values updated
});

// Pull-to-refresh handler
const handleRefresh = async (event: any) => {
  // user triggered refresh
  try {
    // Refresh latest sensor values for the currently selected station
    fetchLatestSensors(selectedStation.value);
    fetchTodayRainfallTotal(selectedStation.value);

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

// Rainfall calculations and warnings
const dailyRainfallTotal = ref(0);

// Function to fetch and calculate today's total rainfall
async function fetchTodayRainfallTotal(stationId: string) {
  try {
    // Reset the daily total
    dailyRainfallTotal.value = 0;
    
    // Calculate start of today with timezone adjustment (like your working code)
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // Add 8 hours timezone offset (matching your working code's addHours(startOfDay(new Date()), 8))
    startOfToday.setHours(8, 0, 0, 0);
    const startTime = Math.floor(startOfToday.getTime() / 1000); // Convert to Unix timestamp in seconds
    
    console.log('Fetching today\'s rainfall data from timestamp:', startTime, new Date(startTime * 1000).toISOString());
    console.log('Station path:', `station${stationId}/data/sensors/RR/`);
    
    // Query Firebase for today's rainfall data (matching your working code structure exactly)
    const collectionRef = dbRef(db, `station${stationId}/data/sensors/RR/`);
    const q = query(collectionRef, orderByKey(), startAt(startTime.toString()));
    
    let accumulatedTotal = 0;
    let readingCount = 0;
    
    // Use onChildAdded to accumulate all rainfall readings for today (same as working code)
    const unsubscribe = onChildAdded(q, (snapshot) => {
      const newData = snapshot.val();
      
      // Handle the data structure like your working code
      let rainfall = 0;
      if (newData && typeof newData === 'object' && newData.val !== undefined) {
        rainfall = parseFloat(newData.val);
      } else if (typeof newData === 'number') {
        rainfall = newData;
      } else if (typeof newData === 'string') {
        rainfall = parseFloat(newData);
      }
      
      // Only add valid rainfall values (same validation as working code)
      if (!isNaN(rainfall) && rainfall >= 0) {
        accumulatedTotal += rainfall;
        readingCount++;
        
        // Update the daily total
        dailyRainfallTotal.value = accumulatedTotal;
        
        const timestamp = snapshot.key;
        if (timestamp) {
          const readingTime = new Date(parseInt(timestamp) * 1000);
          console.log(`Rainfall reading #${readingCount} at ${readingTime.toLocaleString()}: ${rainfall}mm. Running total: ${accumulatedTotal.toFixed(2)}mm`);
        } else {
          console.log(`Rainfall reading #${readingCount}: ${rainfall}mm. Running total: ${accumulatedTotal.toFixed(2)}mm`);
        }
      }
    });
    
    // Log completion after a short delay to see the final result
    setTimeout(() => {
      console.log(`Daily rainfall calculation complete: ${readingCount} readings, total: ${dailyRainfallTotal.value.toFixed(2)}mm`);
    }, 2000);
    
  } catch (error) {
    console.error('Error fetching daily rainfall total:', error);
    dailyRainfallTotal.value = 0;
  }
}

const todayTotalRain = computed(() => {
  // Use the fetched daily total instead of current rainfall intensity
  return dailyRainfallTotal.value;
});

function getRainfallCategory(): string {
  const total = todayTotalRain.value;
  if (total >= 201) return 'RED Warning - Heavy to Intense';
  if (total >= 101) return 'ORANGE Warning - Moderate to Heavy'; 
  if (total >= 50) return 'YELLOW Warning - Light to Moderate';
  return 'Normal';
}

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
/* Fix scrolling issues and improve mobile performance */
.min-h-screen {
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height for mobile */
}

/* Ensure proper scrolling in Ionic */
ion-content {
  --overflow: auto;
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
  -webkit-backdrop-filter: blur(16px);
}

.backdrop-blur-sm {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.backdrop-blur-md {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Smooth transitions */
* {
  transition: all 0.3s ease;
}

/* Touch-friendly scrollbar for mobile */
::-webkit-scrollbar {
  width: 4px;
}

@media (min-width: 768px) {
  ::-webkit-scrollbar {
    width: 6px;
  }
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

/* Enhanced hover effects for desktop */
@media (hover: hover) and (pointer: fine) {
  .transform:hover {
    transform: translateY(-2px);
  }
}

/* Touch-friendly enhancements */
.touch-manipulation {
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* Responsive text and spacing */
@media (max-width: 640px) {
  .min-h-screen {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  /* Adjust font sizes for mobile */
  h1 { font-size: 1.875rem; }
  h2 { font-size: 1.5rem; }
  h3 { font-size: 1.125rem; }
  
  /* Improve touch targets */
  button, a, [role="button"] {
    min-height: 44px;
    min-width: 44px;
  }
}

@media (max-width: 768px) {
  /* Improve card spacing on mobile */
  #metrics-grid {
    gap: 1rem;
  }
}

/* Tablet-specific adjustments for better use of space */
@media (min-width: 768px) and (max-width: 1024px) {
  #metrics-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    max-width: 800px;
  }
  
  /* More compact cards for tablet */
  .card-hover {
    padding: 0.75rem !important;
  }
  
  /* Smaller text in cards for better fit */
  .card-hover h3 {
    font-size: 0.875rem;
  }
  
  .card-hover .text-lg,
  .card-hover .text-xl {
    font-size: 1rem;
  }
  
  .card-hover .text-2xl {
    font-size: 1.25rem;
  }
}

/* Large tablet/desktop adjustments */
@media (min-width: 1024px) {
  #metrics-grid {
    grid-template-columns: repeat(4, 1fr);
    max-width: 1200px;
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

/* Enhanced card hover / focus lift effect */
.card-hover {
  transition: transform 180ms cubic-bezier(.2, .8, .2, 1), box-shadow 180ms cubic-bezier(.2, .8, .2, 1), border-color 180ms;
  will-change: transform, box-shadow;
}

/* Desktop hover effects */
@media (hover: hover) and (pointer: fine) {
  .card-hover:hover,
  .card-hover:focus {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.35);
    outline: none;
  }

  .card-hover:active {
    transform: translateY(-2px) scale(1.005);
  }
}

/* Mobile touch feedback */
@media (hover: none) and (pointer: coarse) {
  .card-hover:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
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
  transition-timing-function: cubic-bezier(.22, .9, .32, 1);
  will-change: background-color, color, box-shadow, filter, transform;
}

/* Safe area adjustments for mobile devices */
@supports (padding: max(0px)) {
  .safe-area-inset {
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }
}

/* Improve performance on mobile */
@media (max-width: 768px) {
  .backdrop-blur-lg,
  .backdrop-blur-md,
  .backdrop-blur-sm {
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
}

/* Specific tablet optimizations */
@media (min-width: 768px) and (max-width: 1024px) {
  /* Better spacing for tablet view */
  .w-full.max-w-4xl {
    max-width: 100%;
    padding: 0 2rem;
  }
  
  /* Optimize hero section for tablet */
  .min-h-\[80vh\] {
    min-height: 70vh;
  }
  
  /* Better button sizing for tablet */
  .w-full.sm\:w-auto {
    width: auto;
    min-width: 200px;
  }
}
</style>
<style scoped>
/* Dark card variant for hero/metrics */
.card-dark {
  background: rgba(8, 10, 15, 0.55) !important;
  border-color: rgba(255, 255, 255, 0.06) !important;
  box-shadow: 0 12px 30px rgba(2, 6, 23, 0.6) !important;
  color: #e6eef8 !important;
  backdrop-filter: blur(10px) saturate(1.05) !important;
}

.card-dark h3 {
  color: #e6eef8 !important;
}

.card-dark span,
.card-dark .text-white-600,
.card-dark .text-white-500 {
  color: rgba(230, 238, 248, 0.95) !important;
}

.card-dark .text-sm {
  color: rgba(200, 210, 220, 0.8) !important;
}

.card-dark .text-2xl {
  color: #9fb7ff !important;
}

.card-dark .text-orange-600 {
  color: #ffb37a !important;
}
</style>
