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

      <!-- Main Content -->
      <div v-if="!currentStation" class="flex flex-col justify-center items-center h-screen">
        <div class="text-center space-y-4">
          <div class="text-6xl">⚠️</div>
          <h2 class="text-2xl font-bold text-white">Loading Stations...</h2>
          <p class="text-gray-300">Please wait while we initialize the app</p>
        </div>
      </div>

      <main v-else-if="currentStation" class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all duration-1000 ease-out"
        :class="getParallaxClass()"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd">

        <!-- Header Section -->
        <div class="relative text-center mb-8 sm:mb-12 pt-12">
          <!-- Station Badge -->
          <div class="inline-flex items-center gap-3 mb-4 px-5 py-2.5 bg-gray-800/60 backdrop-blur-xl rounded-full border border-gray-700/50 shadow-lg hover:border-gray-600/50 transition-all duration-300 hover:scale-105">
            <div class="relative">
              <div class="absolute inset-0 bg-white/20 rounded-full blur-sm opacity-50 animate-pulse"></div>
              <span class="relative text-2xl">📍</span>
            </div>
            <h2 class="text-base sm:text-lg font-bold text-white">
              {{ currentStation?.name }}
            </h2>
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
          </div>

          <!-- Main Title -->
          <div class="relative inline-block mb-3">
            <div class="absolute inset-0 bg-white/5 blur-2xl opacity-20"></div>
            <h1 class="relative text-3xl sm:text-4xl lg:text-5xl font-black text-white drop-shadow-2xl tracking-tight">
              7-Day Weather Summary
            </h1>
          </div>

          <!-- Subtitle -->
          <p class="text-gray-400 text-sm sm:text-base font-medium tracking-wide">
            <span class="inline-flex items-center gap-2">
              <span class="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
              Historical weather data analysis
              <span class="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
            </span>
          </p>

          <!-- Decorative Lines -->
          <div class="flex items-center justify-center gap-3 mt-6">
            <div class="h-px w-16 bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            <div class="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
            <div class="h-px w-24 bg-gray-600"></div>
            <div class="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
            <div class="h-px w-16 bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col justify-center items-center py-12 space-y-6">
          <!-- Weather Radar Loader -->
          <div class="weather-radar-loader">
            <div class="radar-background"></div>
            <div class="radar-sweep"></div>
            <div class="weather-icons">
              <div class="weather-icon sun-icon">☀️</div>
              <div class="weather-icon cloud-icon">☁️</div>
              <div class="weather-icon rain-icon">🌧️</div>
              <div class="weather-icon storm-icon">⛈️</div>
            </div>
            <div class="radar-pulse"></div>
          </div>

          <!-- Loading Text -->
          <div class="text-center space-y-2">
            <div class="text-xl font-semibold text-white animate-pulse">
              Scanning weather patterns...
            </div>
            <div class="text-gray-300 text-sm">
              Analyzing atmospheric data
            </div>
          </div>

          <!-- Progress Wave -->
          <div class="wave-progress">
            <div class="wave-bar"></div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error"
          class="bg-red-900/50 backdrop-blur-sm border border-red-700 rounded-xl p-6 text-center mx-4">
          <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Unable to Load Data</h3>
          <p class="text-red-300 text-sm mb-6">{{ error }}</p>
          <button
            @click="() => fetchSummaryData(true)"
            class="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>

        <!-- Summary Data -->
        <div v-else-if="summaryData.length > 0" class="space-y-6">
          
          <!-- Key Metrics Dashboard -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Temperature Card -->
            <div class="group relative overflow-hidden bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-lg rounded-2xl p-5 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
              <div class="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-3">
                  <div class="p-2 bg-orange-500/20 rounded-lg">
                    <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <span class="text-xs font-medium text-orange-400 uppercase tracking-wide">Avg</span>
                </div>
                <div class="mb-1">
                  <span class="text-3xl font-bold text-white">{{ averageTemp }}</span>
                  <span class="text-lg text-orange-300">°C</span>
                </div>
                <div class="text-sm text-gray-400">Temperature</div>
                <div class="mt-3 h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000" 
                       :style="{ width: `${Math.min(100, (parseFloat(String(averageTemp)) / 40) * 100)}%` }"></div>
                </div>
              </div>
            </div>

            <!-- Humidity Card -->
            <div class="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg rounded-2xl p-5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
              <div class="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-3">
                  <div class="p-2 bg-blue-500/20 rounded-lg">
                    <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
                    </svg>
                  </div>
                  <span class="text-xs font-medium text-blue-400 uppercase tracking-wide">Avg</span>
                </div>
                <div class="mb-1">
                  <span class="text-3xl font-bold text-white">{{ averageHumidity }}</span>
                  <span class="text-lg text-blue-300">%</span>
                </div>
                <div class="text-sm text-gray-400">Humidity</div>
                <div class="mt-3 h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000" 
                       :style="{ width: `${averageHumidity}%` }"></div>
                </div>
              </div>
            </div>

            <!-- Wind Speed Card -->
            <div class="group relative overflow-hidden bg-gradient-to-br from-teal-500/10 to-emerald-500/10 backdrop-blur-lg rounded-2xl p-5 border border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20">
              <div class="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-3">
                  <div class="p-2 bg-teal-500/20 rounded-lg">
                    <svg class="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                  </div>
                  <span class="text-xs font-medium text-teal-400 uppercase tracking-wide">Avg</span>
                </div>
                <div class="mb-1">
                  <span class="text-3xl font-bold text-white">{{ averageWindSpeed }}</span>
                  <span class="text-lg text-teal-300">m/s</span>
                </div>
                <div class="text-sm text-gray-400">Wind Speed</div>
                <div class="mt-3 h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-1000" 
                       :style="{ width: `${Math.min(100, (parseFloat(String(averageWindSpeed)) / 20) * 100)}%` }"></div>
                </div>
              </div>
            </div>

            <!-- Rainfall Card -->
            <div class="group relative overflow-hidden bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl p-5 border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20">
              <div class="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-3">
                  <div class="p-2 bg-indigo-500/20 rounded-lg">
                    <svg class="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                    </svg>
                  </div>
                  <span class="text-xs font-medium text-indigo-400 uppercase tracking-wide">Total</span>
                </div>
                <div class="mb-1">
                  <span class="text-3xl font-bold text-white">{{ totalRainfall }}</span>
                  <span class="text-lg text-indigo-300">mm</span>
                </div>
                <div class="text-sm text-gray-400">Rainfall</div>
                <div class="mt-3 h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000" 
                       :style="{ width: `${Math.min(100, (parseFloat(totalRainfall) / 100) * 100)}%` }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Daily Weather Timeline -->
          <div class="bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden">
            <div class="p-6 border-b border-gray-700/50">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-white mb-1">Daily Weather Timeline</h3>
                  <p class="text-sm text-gray-400">7-day historical analysis</p>
                </div>
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
                    <span class="text-xs text-gray-400">Temp</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                    <span class="text-xs text-gray-400">Humidity</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="p-4 space-y-3">
              <!-- Daily Cards -->
              <div v-for="(day, index) in summaryData" :key="index"
                   :class="[
                     'group bg-gray-800/60 hover:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300',
                     getCardAnimationClass(index)
                   ]"
                   :style="{ animationDelay: `${index * 0.05}s` }">

                <div class="flex items-center gap-4">
                  <!-- Date & Icon -->
                  <div class="flex-shrink-0 text-center min-w-[80px]">
                    <div class="text-3xl mb-1">{{ getWeatherIcon(day) }}</div>
                    <div class="text-sm font-semibold text-white">{{ formatDate(day.date) }}</div>
                    <div class="text-xs text-gray-400">{{ getDayName(day.date).substring(0, 3) }}</div>
                  </div>

                  <!-- Metrics Grid -->
                  <div class="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <!-- Temperature -->
                    <div class="bg-gray-900/40 rounded-lg p-3 border border-orange-500/10 hover:border-orange-500/30 transition-colors">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-orange-400 text-xs">🌡️</span>
                        <span class="text-xs text-gray-400">Temperature</span>
                      </div>
                      <div class="text-lg font-bold text-white">{{ day.temperature.toFixed(1) }}<span class="text-sm text-orange-300">°C</span></div>
                      <div class="flex justify-between text-[10px] text-gray-400 mt-1">
                        <span>↓ {{ day.temperatureMin?.toFixed(1) || '--' }}°</span>
                        <span>↑ {{ day.temperatureMax?.toFixed(1) || '--' }}°</span>
                      </div>
                      <div class="mt-1.5 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                             :style="{ width: getTemperatureBarWidth(day.temperature) }"></div>
                      </div>
                    </div>

                    <!-- Humidity -->
                    <div class="bg-gray-900/40 rounded-lg p-3 border border-blue-500/10 hover:border-blue-500/30 transition-colors">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-blue-400 text-xs">💧</span>
                        <span class="text-xs text-gray-400">Humidity</span>
                      </div>
                      <div class="text-lg font-bold text-white">{{ day.humidity.toFixed(1) }}<span class="text-sm text-blue-300">%</span></div>
                      <div class="mt-1.5 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                             :style="{ width: `${day.humidity}%` }"></div>
                      </div>
                    </div>

                    <!-- Wind Speed -->
                    <div class="bg-gray-900/40 rounded-lg p-3 border border-teal-500/10 hover:border-teal-500/30 transition-colors">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-teal-400 text-xs">💨</span>
                        <span class="text-xs text-gray-400">Wind</span>
                      </div>
                      <div class="text-lg font-bold text-white">{{ day.windSpeed.toFixed(1) }}<span class="text-sm text-teal-300">m/s</span></div>
                      <div class="mt-1.5 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                             :style="{ width: getWindBarWidth(day.windSpeed) }"></div>
                      </div>
                    </div>

                    <!-- Rainfall -->
                    <div class="bg-gray-900/40 rounded-lg p-3 border border-indigo-500/10 hover:border-indigo-500/30 transition-colors">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-indigo-400 text-xs">🌧️</span>
                        <span class="text-xs text-gray-400">Rain</span>
                      </div>
                      <div class="text-lg font-bold text-white">{{ day.rainfall.toFixed(1) }}<span class="text-sm text-indigo-300">mm</span></div>
                      <div class="mt-1.5 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                             :style="{ width: getRainBarWidth(day.rainfall) }"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Wind Direction Badge -->
                  <div class="hidden sm:flex flex-shrink-0 flex-col items-center justify-center min-w-[60px]">
                    <div class="text-xs text-gray-400 mb-1">Wind Dir</div>
                    <div class="px-3 py-1.5 bg-gray-900/60 rounded-lg border border-gray-700/50">
                      <span class="text-sm font-bold text-white">{{ day.windDirection }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Data State -->
        <div v-else class="max-w-md mx-auto">
          <div class="bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-xl p-10 text-center border border-gray-700/50">
            <div class="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-3">No Data Available</h3>
            <p class="text-gray-400 mb-6 text-sm">Weather data for this station hasn't been collected yet.</p>
            <button
              @click="() => fetchSummaryData(true)"
              class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </main>

      <!-- Final Fallback: If nothing renders -->
      <div v-if="!loading && !error && summaryData.length === 0 && currentStation" class="flex flex-col justify-center items-center min-h-screen px-4">
        <div class="max-w-md w-full bg-gray-800/40 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-12 text-center">
          <div class="w-24 h-24 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white mb-3">
            {{ isOffline() ? 'Offline Mode' : 'No Data Available' }}
          </h2>
          <p class="text-gray-400 mb-8 leading-relaxed">
            {{ isOffline() ? 'You are currently offline. No cached data is available for this station.' : 'Weather data for this station hasn\'t been collected yet. Please try refreshing.' }}
          </p>
          <button
            @click="() => fetchSummaryData(true)"
            class="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isOffline()"
          >
            {{ isOffline() ? 'Waiting for Connection...' : 'Refresh Data' }}
          </button>
        </div>
      </div>
    </div>
  </IonContent>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import { getDatabase, ref as dbRef, get, query, orderByKey, startAt, endAt } from 'firebase/database';
import { IonContent, IonRefresher, IonRefresherContent } from '@ionic/vue';
import { wasDataFetchedToday, saveToCache, loadFromCache } from '@/services/offlineStorage';
import { isOnline, isOffline } from '@/services/offlineDetection';

// Reactive state
const selectedStation = ref('station1');
const loading = ref(true);
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
async function fetchSummaryData(forceRefresh = false) {
  if (!currentStation.value) return;

  loading.value = true;
  error.value = '';
  const stationId = selectedStation.value;
  const cacheKey = `summaryData_${stationId}`;

  try {
    // If not forcing a refresh, try to load from cache
    if (!forceRefresh) {
      const cachedData = loadFromCache<any[]>(cacheKey);
      if (cachedData) {
        console.log('📱 SummaryPage: Displaying cached data.');
        summaryData.value = cachedData.map((item: any) => ({
          ...item,
          date: new Date(item.date) // Ensure date is a Date object
        }));
        // If data was fetched today, don't re-fetch unless forced
        if (wasDataFetchedToday(cacheKey)) {
          console.log('📱 SummaryPage: Data was already fetched today. No network request needed.');
          loading.value = false;
          return;
        }
      }
    }

    // If offline and no cached data, show error
    if (!isOnline()) {
      if (summaryData.value.length > 0) {
        console.log('📱 SummaryPage: Offline, but using already loaded cached data.');
        loading.value = false;
        return;
      }
      throw new Error("You are offline. Please connect to the internet to fetch new data.");
    }

    // Fetch fresh data from Firebase
    console.log('🔍 SummaryPage: Fetching fresh data for station:', stationId);
    await fetchFreshData();

  } catch (err: any) {
    console.error('Error in fetchSummaryData:', err);
    // Only set error if there's no data to display
    if (summaryData.value.length === 0) {
      error.value = err.message || 'Failed to load weather data.';
    }
  } finally {
    // Add a small delay for a smoother UI experience
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
}

async function fetchFreshData() {
  if (!currentStation.value) return;

  const stationId = selectedStation.value;
  const cacheKey = `summaryData_${stationId}`;

  try {
    const db = getDatabase();
    const sensorTypes = ['TEM', 'HUM', 'RR', 'LUX', 'WSP'];
    
    // Calculate date range: 7 days ending yesterday (not including today)
    const now = new Date();
    // Get end of yesterday in local time, then add 8 hours for PH timezone (UTC+8)
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
    const yesterdayUnix = Math.floor(yesterday.getTime() / 1000) + (8 * 3600); // Add 8 hours for timezone
    
    // Store data by day (using start of day unix as key)
    const datum: { [key: number]: { [sensor: string]: any } } = {};
    
    // Fetch data for each sensor for each of the 7 days
    const promises: Promise<void>[] = [];
    
    for (const sensor of sensorTypes) {
      for (let i = 0; i < 7; i++) {
        const endUnix = yesterdayUnix - (86400 * i);
        const startUnix = endUnix - 86400 + 1;
        
        if (!datum[startUnix]) datum[startUnix] = {};
        
        promises.push(
          getDailyData(db, stationId, sensor, String(startUnix), String(endUnix))
            .then(data => {
              datum[startUnix][sensor] = data;
            })
        );
      }
    }
    
    await Promise.all(promises);
    
    // Process the data into the format we need
    const days = Object.keys(datum).sort((a, b) => parseInt(a) - parseInt(b)); // Sort oldest to newest
    
    if (days.length === 0) {
      summaryData.value = [];
      saveToCache(cacheKey, []);
      console.log('❌ SummaryPage: No sensor data found. Cached empty array.');
      return;
    }
    
    const processedData: any[] = days.map(dayKey => {
      const dayUnix = parseInt(dayKey);
      const date = new Date(dayUnix * 1000);
      const weather = datum[dayUnix];
      
      // Get temperature data (has average, lowestTemp, highestTemp)
      const tempData = weather.TEM || { average: 0, lowestTemp: 0, highestTemp: 0 };
      
      return {
        date: date,
        temperature: parseFloat(tempData.average) || 0,
        temperatureMin: parseFloat(tempData.lowestTemp) || 0,
        temperatureMax: parseFloat(tempData.highestTemp) || 0,
        humidity: parseFloat(weather.HUM) || 0,
        rainfall: parseFloat(weather.RR) || 0,
        lux: parseFloat(weather.LUX) || 0,
        windSpeed: parseFloat(weather.WSP) || 0,
        windDirection: 'N'
      };
    });
    
    summaryData.value = processedData;
    saveToCache(cacheKey, processedData);
    console.log('✅ SummaryPage: Fresh data fetched and cached.', processedData);

  } catch (err: any) {
    console.error('Error fetching fresh data:', err);
    throw err;
  }
}

// Fetch daily data for a specific sensor
async function getDailyData(db: any, stationId: string, sensor: string, startUnix: string, endUnix: string): Promise<any> {
  try {
    const sensorRef = dbRef(db, `${stationId}/data/sensors/${sensor}/`);
    const sensorQuery = query(sensorRef, orderByKey(), startAt(startUnix), endAt(endUnix));
    const snapshot = await get(sensorQuery);
    const data = snapshot.val();
    
    if (!data) {
      // Return appropriate fallback based on sensor type
      if (sensor === 'RR') return 0;
      if (sensor === 'TEM') return { average: 0, lowestTemp: 0, highestTemp: 0 };
      return 0;
    }
    
    // For rainfall, sum all values (total)
    if (sensor === 'RR') {
      return getDailyTotal(data);
    }
    
    // For other sensors, calculate average (and min/max for temperature)
    return getDailyDataAverage(data, sensor);
  } catch (error) {
    console.error(`Error fetching data for sensor ${sensor}:`, error);
    if (sensor === 'RR') return 0;
    if (sensor === 'TEM') return { average: 0, lowestTemp: 0, highestTemp: 0 };
    return 0;
  }
}

// Calculate daily average (and min/max for temperature)
function getDailyDataAverage(data: any, sensor: string): any {
  if (!data || data === 0) {
    if (sensor === 'TEM') {
      return { average: 0, lowestTemp: 0, highestTemp: 0 };
    }
    return 0;
  }
  
  const values = Object.values(data);
  let total = 0;
  let count = 0;
  let lowestTemp = Infinity;
  let highestTemp = -Infinity;
  
  values.forEach((el: any) => {
    if (el && el.val !== undefined) {
      const value = parseFloat(el.val);
      if (!isNaN(value)) {
        if (sensor === 'TEM') {
          lowestTemp = Math.min(lowestTemp, value);
          highestTemp = Math.max(highestTemp, value);
        }
        total += value;
        count++;
      }
    }
  });
  
  if (count === 0) {
    if (sensor === 'TEM') {
      return { average: 0, lowestTemp: 0, highestTemp: 0 };
    }
    return 0;
  }
  
  if (sensor === 'TEM') {
    return {
      average: (total / count).toFixed(2),
      lowestTemp: lowestTemp === Infinity ? 0 : lowestTemp.toFixed(2),
      highestTemp: highestTemp === -Infinity ? 0 : highestTemp.toFixed(2)
    };
  }
  
  return (total / count).toFixed(2);
}

// Calculate daily total (for rainfall)
function getDailyTotal(data: any): number {
  if (!data || data === 0) {
    return 0;
  }
  
  let total = 0;
  const values = Object.values(data);
  
  values.forEach((val: any) => {
    if (val && val.val !== undefined) {
      const value = parseFloat(val.val);
      if (!isNaN(value)) {
        total += value;
      }
    }
  });
  
  return parseFloat(total.toFixed(2));
}

// Helper functions for styling
function getTemperatureBarWidth(temp: number): string {
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
  try {
    const rainfall = day?.rainfall || 0;
    const temperature = day?.temperature || 0;
    
    if (rainfall > 10) return '🌧️';
    if (temperature > 30) return '☀️';
    if (temperature < 20) return '❄️';
    return '⛅';
  } catch (err) {
    console.warn('⚠️ Error getting weather icon:', err);
    return '⛅';
  }
}

// Date formatting
function formatDate(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric'
    };
    return dateObj.toLocaleDateString('en-US', options);
  } catch (err) {
    console.warn('⚠️ Error formatting date:', err);
    return 'N/A';
  }
}

function getDayName(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long'
    };
    return dateObj.toLocaleDateString('en-US', options);
  } catch (err) {
    console.warn('⚠️ Error getting day name:', err);
    return 'Unknown';
  }
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
    await fetchSummaryData(true); // Force refresh
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

// Cleanup on unmount
onUnmounted(() => {
  // Note: We don't destroy the offline detection service here as it's a singleton
  // and may be used by other components
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
.animation-delay-0 {
  animation-delay: 0ms;
}

.animation-delay-80 {
  animation-delay: 80ms;
}

.animation-delay-160 {
  animation-delay: 160ms;
}

.animation-delay-240 {
  animation-delay: 240ms;
}

.animation-delay-320 {
  animation-delay: 320ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}

.animation-delay-480 {
  animation-delay: 480ms;
}

.animation-delay-500 {
  animation-delay: 500ms;
}

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

/* Weather Radar Loader Styles */
.weather-radar-loader {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.radar-background {
  position: absolute;
  width: 180px;
  height: 180px;
  border: 3px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
}

.radar-background::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120px;
  height: 120px;
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.radar-background::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.radar-sweep {
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent 0deg, rgba(59, 130, 246, 0.6) 30deg, transparent 60deg);
  animation: radarSweep 3s linear infinite;
  clip-path: circle(50%);
}

@keyframes radarSweep {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.weather-icons {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.weather-icon {
  position: absolute;
  font-size: 24px;
  animation: weatherIconFloat 4s ease-in-out infinite;
  opacity: 0.8;
}

.weather-icon.sun-icon {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 0s;
  color: #fbbf24;
}

.weather-icon.cloud-icon {
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  animation-delay: 1s;
  color: #9ca3af;
}

.weather-icon.rain-icon {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  animation-delay: 2s;
  color: #3b82f6;
}

.weather-icon.storm-icon {
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  animation-delay: 3s;
  color: #6b7280;
}

@keyframes weatherIconFloat {

  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.6;
  }

  50% {
    transform: translateY(-10px) scale(1.1);
    opacity: 1;
  }
}

.radar-pulse {
  position: absolute;
  width: 20px;
  height: 20px;
  background: rgba(59, 130, 246, 0.8);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: radarPulse 2s ease-in-out infinite;
}

@keyframes radarPulse {

  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0.3;
  }
}

/* Wave Progress Bar */
.wave-progress {
  width: 200px;
  height: 4px;
  background: rgba(75, 85, 99, 0.3);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.wave-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #06b6d4, #3b82f6);
  background-size: 200% 100%;
  animation: waveProgress 2s ease-in-out infinite;
  border-radius: 2px;
}

@keyframes waveProgress {
  0% {
    width: 0%;
    background-position: 0% 50%;
  }

  50% {
    width: 70%;
    background-position: 100% 50%;
  }

  100% {
    width: 100%;
    background-position: 200% 50%;
  }
}
</style>