<template>
  <IonContent class="ion-no-padding" fullscreen scrollEvents @ionScroll="handleIonScroll">
    <!-- Pull to refresh -->
    <IonRefresher slot="fixed" @ionRefresh="handleRefresh">
      <IonRefresherContent pulling-text="Pull to refresh" refreshing-spinner="lines" />
    </IonRefresher>
    <div class="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <!-- Scroll Progress Indicator -->
      <div class="fixed top-0 left-0 w-full h-1 bg-gray-800/50 z-50">
        <div class="h-full scroll-progress transition-all duration-200 ease-out"
          :style="{ width: `${scrollProgress * 100}%` }"></div>
      </div>

      <!-- Swipe Indicator -->
      <div v-if="isSwipeActive" class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
        <div class="bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <span class="text-sm">Swipe to switch stations</span>
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.2s;"></div>
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.4s;"></div>
          </div>
        </div>
      </div>

      <div class="relative z-30 flex-1"
        :style="{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }">

        <!-- Main Content -->
        <div class="relative z-10">

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
                  <div v-if="selectedStation === station.id && currentStation" class="grid grid-cols-2 gap-3 text-sm">
                    <div class="bg-gray-800/60 rounded-lg p-3">
                      <div class="text-gray-400 text-xs mb-1">Temperature</div>
                      <div class="text-white font-bold">{{ currentStation.data.temperature }}°C</div>
                    </div>
                    <div class="bg-gray-800/60 rounded-lg p-3">
                      <div class="text-gray-400 text-xs mb-1">Humidity</div>
                      <div class="text-white font-bold">{{ currentStation.data.humidity }}%</div>
                    </div>
                    <div class="bg-gray-800/60 rounded-lg p-3">
                      <div class="text-gray-400 text-xs mb-1">Wind Speed</div>
                      <div class="text-white font-bold">{{ currentStation.data.windSpeed }} m/s</div>
                    </div>
                    <div class="bg-gray-800/60 rounded-lg p-3">
                      <div class="text-gray-400 text-xs mb-1">Rainfall</div>
                      <div class="text-white font-bold">{{ currentStation.data.rainfall }} mm</div>
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
              <div class="mt-6 pt-6 border-t border-gray-700">
                <button @click="openMapModal"
                  class="w-full flex items-center space-x-3 p-4 rounded-xl bg-gray-800/50 border border-gray-600 hover:bg-gray-700/50 hover:border-gray-500 transition-all duration-200">
                  <span class="text-xl">🗺️</span>
                  <span class="text-white font-medium">View Map</span>
                  <svg class="w-4 h-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <main class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all duration-1000 ease-out" :class="{
            'station-transition-out-left': isTransitioning && transitionDirection === 'left',
            'station-transition-out-right': isTransitioning && transitionDirection === 'right',
            'station-transition-in': !isTransitioning
          }" v-if="currentStation"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove" 
          @touchend="handleTouchEnd">

            <!-- Current Weather Hero Section -->
            <div :class="[
              'w-full flex items-center justify-center min-h-[50vh] sm:min-h-[45vh] md:min-h-[40vh] lg:min-h-[35vh] pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-4 sm:pb-6 md:pb-8 lg:pb-12 transition-all duration-700 ease-out relative overflow-hidden',
              isTransitioning && transitionDirection === 'left' ? 'hero-transition-out-left' : '',
              isTransitioning && transitionDirection === 'right' ? 'hero-transition-out-right' : '',
              !isTransitioning ? 'hero-transition-in' : ''
            ]" ref="heroSection">

              <!-- Cloud Background Animation - Only for Cloudy Weather -->
              <CloudAnimation :is-visible="isCloudyWeather()" />

              <!-- Rain Animation - Only for Rainy Weather -->
              <RainAnimation :is-visible="isRainingWeather()" :intensity="getRainIntensity()" />

              <section class="w-full relative z-20 mt-4 sm:mt-6 md:mt-8 lg:-mt-5 ">
                <div class="w-full max-w-5xl mx-auto rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10">
                  <div class="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 lg:gap-8">
                    <!-- Main Weather Display -->
                    <div class="text-center  pr-16 sm:text-center lg:text-center mb-4 lg:mb-0 flex-1">
                      <div
                        class="flex flex-col sm:flex-row items-start justify-start space-y-3 sm:space-y-0 sm:space-x-4 mb-3 pr-10">
                        <div class="text-9xl sm:text-9xl md:text-[10rem] lg:text-[12rem] animate-bounce text-left">
                          {{ getWeatherIcon() }}
                        </div>
                        <div class="text-center sm:text-left">
                          <div class="text-7xl sm:text-4xl md:text-8xl lg:text-[8rem] font-bold text-white">
                            {{ currentStation.data.temperature }}°
                          </div>
                          <div class="text-base sm:text-lg md:text-xl text-white font-medium mt-1 text-left lg:text-[2rem]">
                            {{ currentStation.name }}
                          </div>
                        </div>
                      </div>

                      <!-- Weather Description -->
                      <div class="text-sm sm:text-base md:text-lg text-white/90 mb-3 max-w-md mx-auto lg:mx-0 lg:text-3xl">
                        {{ getWeatherDescription() }}
                      </div>

                      <!-- Quick Stats -->
                      <div class="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 max-w-xs sm:max-w-sm mx-auto lg:mx-0 ">
                        <div
                          class="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6  text-center border border-slate-700/50">
                          <div class="text-lg sm:text-xl md:text-2xl font-bold text-blue-400 lg:text-4xl">{{
                            currentStation.data.humidity }}%</div>
                          <div class="text-xs sm:text-sm lg:text-xl text-blue-300">Humidity</div>
                        </div>
                        <div
                          class="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 text-center border border-slate-700/50">
                          <div class="text-lg sm:text-xl md:text-2xl font-bold lg:text-4xl text-orange-400">
                            {{ currentStation.data.heatIndex }}°</div>
                          <div class="text-xs sm:text-sm text-orange-300 lg:text-xl">Heat Index</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <section class="lg:-mt-20 md:-mt-24 sm:-mt-2 -mt-10">
              <!-- Weather Metrics Grid -->
              <transition name="fade">
                <div v-if="showWindSpeedTable" class="mt-6">
                  <WindSpeedTable ref="windSpeedTableRef" :stationId="currentStation.id"
                    :currentWindSpeed="currentStation.data.windSpeed" :isTransforming="isTransformingWind"
                    @animation-complete="onWindAnimationComplete" @close-table="toggleWindChart" />
                </div>
              </transition>
              <transition name="fade">
                <div v-if="showRainfallTable" class="mt-6">
                  <RainfallTable ref="rainfallTableRef" :stationId="currentStation.id"
                    :currentRainfall="currentStation.data.rainfall" :isTransforming="isTransformingRainfall"
                    @animation-complete="onRainfallAnimationComplete" @close-table="toggleRainfallChart" />
                </div>
              </transition>
              <transition name="fade">
                <div v-if="showTemperatureTable" class="mt-6">
                  <TemperatureTable ref="temperatureTableRef" :stationId="currentStation.id"
                    :currentTemperature="currentStation.data.temperature" :isTransforming="isTransformingTemperature"
                    @animation-complete="onTemperatureAnimationComplete" @close-table="toggleTemperatureTable" />
                </div>
              </transition>
            </section>


            <!-- Temporary Debug Component -->
            <!-- <div class="mt-6">
            <FirebaseDebug :stationId="selectedStation" />
          </div> -->
            <section class="lg:mt-1 md:mt-8 mt-10">
              <h2
                class="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 md:mb-6 -mt-1 sm:mt-6 md:mt-10 text-center lg:text-left">
                Weather Metrics</h2>
              <div id="metrics-grid" :key="cardRefreshKey"
                class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-4 lg:gap-6 max-w-6xl mx-auto transition-all duration-500 ease-out"
                :class="{
                  'opacity-30 scale-95': isTransitioning,
                  'opacity-100 scale-100': !isTransitioning
                }">
                <!-- Temperature & Humidity -->
                <!-- Enhanced Rainfall Card -->
                <div data-card-id="RainfallIntensity" :class="[
                  'bg-slate-800/60 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-3 shadow-md border border-slate-700/50 card-hover card-transition touch-manipulation col-span-2 sm:col-span-2 md:col-span-3',
                  cardsDarkened ? 'card-dark' : '',
                  getCardAnimationClass(0)
                ]">
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
                            <p :class="todayTotalRain >= 50.0 && todayTotalRain <= 100.0 ? 'text-white text-[10px] md:text-xs opacity-100' : 'hidden'"
                              class="absolute inset-0 flex items-center justify-center font-bold">
                              YELLOW (50-100mm)
                            </p>
                          </div>

                          <!-- Orange Warning -->
                          <div
                            :class="todayTotalRain >= 101.0 && todayTotalRain <= 200.0 ? 'w-full bg-orange-600 transition-all duration-300' : 'bg-gray-600/50 w-8'"
                            class="h-4 flex items-center justify-center rounded-sm relative">
                            <p :class="todayTotalRain >= 101.0 && todayTotalRain <= 200.0 ? 'text-white text-[10px] md:text-xs opacity-100' : 'hidden'"
                              class="absolute inset-0 flex items-center justify-center font-bold">
                              ORANGE (101-200mm)
                            </p>
                          </div>

                          <!-- Red Warning -->
                          <div
                            :class="todayTotalRain >= 201.0 ? 'w-full bg-red-700 transition-all duration-300' : 'bg-gray-600/50 w-8'"
                            class="h-4 flex items-center justify-center rounded-r-lg rounded-l-sm relative">
                            <p :class="todayTotalRain >= 201.0 ? 'text-white text-[10px] md:text-xs opacity-100' : 'hidden'"
                              class="absolute inset-0 flex items-center justify-center font-bold">
                              RED (201mm+)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div data-card-id="Temperature" :class="[
                  'bg-slate-800/60 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-3 shadow-md border border-slate-700/50 cursor-pointer select-none card-hover card-transition touch-manipulation transition-all duration-500 ease-in-out',
                  cardsDarkened ? 'card-dark' : '',
                  isTransformingTemperature ? 'transform-to-table' : '',
                  showTemperatureTable && !isTransformingTemperature ? 'hidden' : 'opacity-100 scale-100',
                  getCardAnimationClass(1)
                ]" role="button" :aria-expanded="showTemperatureTable" @click="toggleTemperatureTable"
                  @keydown.enter="toggleTemperatureTable" @keydown.space.prevent="toggleTemperatureTable">

                  <!-- Card to Table Transformation Overlay -->
                  <div v-if="isTransformingTemperature" class="transform-overlay">
                    <div class="transform-particles">
                      <div v-for="n in 12" :key="n" class="particle" :style="{ animationDelay: `${n * 0.1}s` }"></div>
                    </div>
                    <div class="transform-text">
                      <svg class="transform-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="!showTemperatureTable" stroke-linecap="round" stroke-linejoin="round"
                          stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                      </svg>
                      <span v-if="!showTemperatureTable">Expanding to table...</span>
                      <span v-else>Collapsing to card...</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between mb-3 md:mb-4">
                    <h3 class="text-sm font-semibold text-white">Temperature</h3>
                    <span class="text-xl md:text-2xl">🌡️</span>
                  </div>
                  <div class="space-y-2 md:space-y-3">
                    <div class="flex justify-between items-center">
                      <span class="text-white/80 text-xs md:text-sm">Current</span>
                      <span class="text-base md:text-lg lg:text-xl font-bold text-white">{{
                        currentStation.data.temperature }}°C</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-white/80 text-xs md:text-sm">Feels like</span>
                      <span class="text-xs md:text-sm font-semibold text-orange-400">{{ currentStation.data.heatIndex
                      }}°C</span>
                    </div>
                    <div class="flex justify-end items-center space-x-1">
                      <span class="text-xs md:text-sm font-semibold text-white-400 text-right">
                        View more data
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                  </div>
                </div>

                <!-- Wind -->
                <div data-card-id="Wind" :class="[
                  'bg-slate-800/60 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-3 shadow-md border border-slate-700/50 cursor-pointer select-none card-hover card-transition touch-manipulation transition-all duration-500 ease-in-out',
                  cardsDarkened ? 'card-dark' : '',
                  isTransformingWind ? 'transform-to-table' : '',
                  showWindSpeedTable && !isTransformingWind ? 'hidden' : 'opacity-100 scale-100',
                  getCardAnimationClass(2)
                ]" role="button" :aria-expanded="showWindSpeedTable" @click="toggleWindChart"
                  @keydown.enter="toggleWindChart" @keydown.space.prevent="toggleWindChart">

                  <!-- Card to Table Transformation Overlay -->
                  <div v-if="isTransformingWind" class="transform-overlay">
                    <div class="transform-particles">
                      <div v-for="n in 12" :key="n" class="particle" :style="{ animationDelay: `${n * 0.1}s` }"></div>
                    </div>
                    <div class="transform-text">
                      <svg class="transform-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="!showWindSpeedTable" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                      </svg>
                      <span v-if="!showWindSpeedTable">Expanding to table...</span>
                      <span v-else>Collapsing to card...</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between mb-3 md:mb-4">
                    <h3 class="text-sm font-semibold text-white">Wind</h3>
                    <WindCompass :windDirection="currentStation.data.windAngle || 0"
                      :windSpeed="currentStation.data.windSpeed || 0" />
                  </div>
                  <div class="space-y-2 md:space-y-3">
                    <div class="flex justify-between items-center">
                      <span class="text-white/80 text-xs md:text-sm">Speed</span>
                      <span class="text-base md:text-lg lg:text-xl font-bold text-white">{{
                        currentStation.data.windSpeed }} m/s</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-white/80 text-xs md:text-sm">Direction</span>
                      <span class="text-xs md:text-sm font-semibold text-blue-400">{{ currentStation.data.windDirection
                      }}</span>
                    </div>
                  </div>
                </div>

                <!-- Precipitation -->
                <div data-card-id="Precipitation" :class="[
                  'bg-slate-800/60 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-3 shadow-md border border-slate-700/50 cursor-pointer select-none card-hover card-transition touch-manipulation transition-all duration-500 ease-in-out',
                  cardsDarkened ? 'card-dark' : '',
                  isTransformingRainfall ? 'transform-to-table' : '',
                  showRainfallTable && !isTransformingRainfall ? 'hidden' : 'opacity-100 scale-100',
                  getCardAnimationClass(3)
                ]" role="button" :aria-expanded="showRainfallTable" @click="toggleRainfallChart"
                  @keydown.enter="toggleRainfallChart" @keydown.space.prevent="toggleRainfallChart">

                  <!-- Card to Table Transformation Overlay -->
                  <div v-if="isTransformingRainfall" class="transform-overlay">
                    <div class="transform-particles">
                      <div v-for="n in 12" :key="n" class="particle" :style="{ animationDelay: `${n * 0.1}s` }"></div>
                    </div>
                    <div class="transform-text">
                      <svg class="transform-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="!showRainfallTable" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                      </svg>
                      <span v-if="!showRainfallTable">Expanding to table...</span>
                      <span v-else>Collapsing to card...</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between mb-3 md:mb-4">
                    <h3 class="text-sm font-semibold text-white">Precipitation</h3>
                    <span class="text-xl md:text-2xl">🌧️</span>
                  </div>
                  <div class="space-y-2 md:space-y-3">
                    <div class="flex justify-between items-center">
                      <span class="text-white/80 text-xs md:text-sm">Rainfall</span>
                      <span class="text-base md:text-lg lg:text-xl font-bold text-white">{{ currentStation.data.rainfall
                      }} mm</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-white/80 text-xs md:text-sm">Humidity</span>
                      <span class="text-xs md:text-sm font-semibold text-blue-400">{{ currentStation.data.humidity
                      }}%</span>
                    </div>
                  </div>
                </div>



                <!-- Atmospheric -->
                <div data-card-id="Atmospheric" :class="[
                  'bg-slate-800/60 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-3 shadow-md border border-slate-700/50 card-hover card-transition touch-manipulation',
                  cardsDarkened ? 'card-dark' : '',
                  getCardAnimationClass(4)
                ]">
                  <div class="flex items-center justify-between mb-3 md:mb-4">
                    <h3 class="text-sm font-semibold text-white">Atmospheric</h3>
                    <span class="text-xl md:text-2xl">🧪</span>
                  </div>
                  <div class="space-y-2 md:space-y-3">
                    <div class="flex justify-between items-center">
                      <span class="text-white/80 text-xs md:text-sm">Pressure</span>
                      <span class="text-base md:text-lg lg:text-xl font-bold text-white">{{ currentStation.data.pressure
                      }} hPa</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-white/80 text-xs md:text-sm">Solar</span>
                      <span class="text-xs md:text-sm font-semibold text-yellow-400">{{ currentStation.data.solar }}
                        W/m²</span>
                    </div>
                  </div>
                </div>
                <!-- Soil Moisture -->
                <div data-card-id="SoilMoisture" :class="[
                  'bg-slate-800/60 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-3 shadow-md border border-slate-700/50 card-hover card-transition touch-manipulation',
                  cardsDarkened ? 'card-dark' : '',
                  getCardAnimationClass(5)
                ]">
                  <div class="flex items-center justify-between mb-3 md:mb-4">
                    <h3 class="text-sm font-semibold text-white">Soil Moisture</h3>
                    <span class="text-xl md:text-2xl">🌱</span>
                  </div>
                  <div class="text-center">
                    <div class="text-lg md:text-xl lg:text-2xl font-bold text-green-400 mb-2">{{
                      currentStation.data.soilMoisture }}%</div>
                    <div class="w-full bg-slate-700/50 rounded-full h-2 md:h-3">
                      <div
                        class="bg-gradient-to-r from-green-400 to-green-600 h-2 md:h-3 rounded-full transition-all duration-500"
                        :style="{ width: currentStation.data.soilMoisture + '%' }"></div>
                    </div>
                  </div>
                </div>
                <!-- Soil Temperature -->
                <div data-card-id="SoilTemp" :class="[
                  'bg-slate-800/60 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-3 shadow-md border border-slate-700/50 card-hover card-transition touch-manipulation',
                  cardsDarkened ? 'card-dark' : '',
                  getCardAnimationClass(6)
                ]">
                  <div class="flex items-center justify-between mb-3 md:mb-4">
                    <h3 class="text-sm font-semibold text-white">Soil Temperature</h3>
                    <span class="text-xl md:text-2xl">🌡️</span>
                  </div>
                  <div class="text-center">
                    <div class="text-lg md:text-xl lg:text-2xl font-bold text-yellow-400 mb-2">{{
                      currentStation.data.soilTemp }}°C</div>
                    <div class="text-xs md:text-sm text-white/80">Underground reading</div>
                  </div>
                </div>
                <!-- Light Intensity -->
                <div data-card-id="LightIntensity" :class="[
                  'bg-slate-800/60 backdrop-blur-lg rounded-2xl p-3 sm:p-4 md:p-3 shadow-md border border-slate-700/50 card-hover card-transition touch-manipulation',
                  cardsDarkened ? 'card-dark' : '',
                  getCardAnimationClass(7)
                ]">
                  <div class="flex items-center justify-between mb-3 md:mb-4">
                    <h3 class="text-sm font-semibold text-white">Light Intensity</h3>
                    <span class="text-xl md:text-2xl">💡</span>
                  </div>
                  <div class="text-center">
                    <div class="text-lg md:text-xl lg:text-2xl font-bold text-purple-400 mb-2">{{
                      currentStation.data.illumination }}</div>
                    <div class="text-xs md:text-sm text-white/80">lux</div>
                  </div>
                </div>
              </div>
            </section>


            <!-- Action Buttons -->
            <section class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 mt-6 px-4">
              <router-link to="/summary"
                class="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 sm:px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 touch-manipulation min-h-[44px]">
                <span>📊</span>
                <span>View 7-Day Summary</span>
              </router-link>

              <button v-if="currentStation && currentStation.data.heatIndex > 35" @click="openHeatAlert"
                class="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 text-white px-6 sm:px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 animate-pulse touch-manipulation min-h-[44px]">
                <span>🚨</span>
                <span>Heat Alert Active</span>
              </button>
            </section>
          </main>
        </div>

        <!-- Heat Alert handled by SweetAlert2 component -->
        <HeatAlert ref="heatAlertRef" />

        <!-- Interactive Map Component -->
        <InteractiveMap :is-open="isMapModalOpen" :stations="stationsWithData" :current-station="currentStation"
          :selected-station="selectedStation" @close="closeMapModal" @station-selected="handleMapStationSelection" />
      </div>
    </div>
  </IonContent>
</template>

<script setup lang="ts">
import TemperatureTable from '../components/TemperatureTable.vue';
import WindSpeedTable from '../components/WindSpeedTable.vue';
import RainfallTable from '../components/RainfallTable.vue';
import HeatAlert from '../components/HeatAlert.vue';
import InteractiveMap from '../components/InteractiveMap.vue';
import CloudAnimation from '../components/CloudAnimation.vue';
import RainAnimation from '../components/RainAnimation.vue';
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
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
// Map modal state
const isMapModalOpen = ref(false);

// Computed property for stations with current data
const stationsWithData = computed(() => {
  return stations.value.map(station => ({
    ...station,
    data: station.id === selectedStation.value ? currentStation.value?.data : null
  }));
});

// Parallax effect for hero section
const scrollOffset = ref(0);
const heroSection = ref<HTMLElement | null>(null);

// Station transition animation states
const isTransitioning = ref(false);
const transitionDirection = ref<'left' | 'right'>('left');
const cardAnimationPattern = ref<string>('default');
const staggerDelay = ref(0);
const cardRefreshKey = ref(0); // Force card re-render for animations

// Swipe functionality
const touchStartX = ref(0);
const touchStartY = ref(0);
const touchEndX = ref(0);
const touchEndY = ref(0);
const isSwipeActive = ref(false);
const swipeThreshold = 50; // Minimum distance to trigger swipe
const swipeTimeThreshold = 300; // Maximum time for a valid swipe (ms)
const swipeStartTime = ref(0);

// Side navigation state
const isNavOpen = ref(false);

// Show/hide wind chart when clicking the Wind card
const showWindChart = ref(false);

function toggleWindChart() {
  if (!showWindSpeedTable.value) {
    // Starting transformation - show animation
    isTransformingWind.value = true;

    // After a delay, show the table and hide transformation
    setTimeout(() => {
      showWindSpeedTable.value = true;
      isTransformingWind.value = false;

      // Trigger data fetch
      setTimeout(() => {
        try {
          const child: any = windSpeedTableRef.value;
          if (child && typeof child.fetchWindData === 'function') {
            child.fetchWindData(selectedStation.value);
          }
        } catch (e) {
          console.warn('Failed to refresh wind speed table on toggle', e);
        }
      }, 100);
    }, 800); // Duration of transformation animation
  } else {
    // Closing table - start reverse transformation
    isTransformingWind.value = true;

    // First hide the table with exit animation
    const child: any = windSpeedTableRef.value;
    if (child && child.$el) {
      child.$el.classList.add('table-exiting');
    }

    // After table exit animation, show card transformation
    setTimeout(() => {
      showWindSpeedTable.value = false;
      // Keep transformation overlay for reverse effect
      setTimeout(() => {
        isTransformingWind.value = false;
      }, 600); // Reverse transformation duration
    }, 400); // Table exit duration
  }
}
// Show/hide rainfall chart (same logic as wind)
const showRainfallChart = ref(false);
const rainfallChartRef = ref(null);
// Show/hide temperature table
const showTemperatureTable = ref(false);
const temperatureTableRef = ref(null);
const isTransformingTemperature = ref(false);

// Show/hide wind speed table
const showWindSpeedTable = ref(false);
const windSpeedTableRef = ref(null);
const isTransformingWind = ref(false);

// Show/hide rainfall table
const showRainfallTable = ref(false);
const rainfallTableRef = ref(null);
const isTransformingRainfall = ref(false);
function toggleRainfallChart() {
  if (!showRainfallTable.value) {
    // Starting transformation - show animation
    isTransformingRainfall.value = true;

    // After a delay, show the table and hide transformation
    setTimeout(() => {
      showRainfallTable.value = true;
      isTransformingRainfall.value = false;

      // Trigger data fetch
      setTimeout(() => {
        try {
          const child: any = rainfallTableRef.value;
          if (child && typeof child.fetchRainfallData === 'function') {
            child.fetchRainfallData(selectedStation.value);
          }
        } catch (e) {
          console.warn('Failed to refresh rainfall table on toggle', e);
        }
      }, 100);
    }, 800); // Duration of transformation animation
  } else {
    // Closing table - start reverse transformation
    isTransformingRainfall.value = true;

    // First hide the table with exit animation
    const child: any = rainfallTableRef.value;
    if (child && child.$el) {
      child.$el.classList.add('table-exiting');
    }

    // After table exit animation, show card transformation
    setTimeout(() => {
      showRainfallTable.value = false;
      // Keep transformation overlay for reverse effect
      setTimeout(() => {
        isTransformingRainfall.value = false;
      }, 600); // Reverse transformation duration
    }, 400); // Table exit duration
  }
}

function toggleTemperatureTable() {
  if (!showTemperatureTable.value) {
    // Starting transformation - show animation
    isTransformingTemperature.value = true;

    // After a delay, show the table and hide transformation
    setTimeout(() => {
      showTemperatureTable.value = true;
      isTransformingTemperature.value = false;

      // Trigger data fetch
      setTimeout(() => {
        try {
          const child: any = temperatureTableRef.value;
          if (child && typeof child.fetchTemperatureData === 'function') {
            child.fetchTemperatureData(selectedStation.value);
          }
        } catch (e) {
          console.warn('Failed to refresh temperature table on toggle', e);
        }
      }, 100);
    }, 800); // Duration of transformation animation
  } else {
    // Closing table - start reverse transformation
    isTransformingTemperature.value = true;

    // First hide the table with exit animation
    const child: any = temperatureTableRef.value;
    if (child && child.$el) {
      child.$el.classList.add('table-exiting');
    }

    // After table exit animation, show card transformation
    setTimeout(() => {
      showTemperatureTable.value = false;
      // Keep transformation overlay for reverse effect
      setTimeout(() => {
        isTransformingTemperature.value = false;
      }, 600); // Reverse transformation duration
    }, 400); // Table exit duration
  }
}

function onTemperatureAnimationComplete() {
  isTransformingTemperature.value = false;
}

function onWindAnimationComplete() {
  isTransformingWind.value = false;
}

function onRainfallAnimationComplete() {
  isTransformingRainfall.value = false;
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

// Map modal functions
function openMapModal() {
  isMapModalOpen.value = true;
}

function closeMapModal() {
  isMapModalOpen.value = false;
}

function handleMapStationSelection(stationId: string) {
  const stationIndex = stations.value.findIndex(s => s.id === stationId);
  if (stationIndex !== -1) {
    changeStation(stationId, stationIndex);
  }
}

// Function to get weather icon based on weather conditions for station popups
function getStationWeatherIcon(stationData: any): string {
  if (!stationData) return '⛅';

  const weatherCondition = determineWeatherCondition(stationData);

  // Return emoji based on weather condition (same logic as main weather icon)
  if (weatherCondition.wType.includes('Intense') || weatherCondition.wType.includes('Torrential')) return '🌊';
  if (weatherCondition.wType.includes('Heavy')) return '🌧️';
  if (weatherCondition.wType.includes('Moderate')) return '🌦️';
  if (weatherCondition.wType.includes('Light Rain')) return '�️';
  if (weatherCondition.wType.includes('Cloudy')) return '☁️';
  if (weatherCondition.wType.includes('Partly Cloudy')) return '⛅';
  if (weatherCondition.wType.includes('Sunny')) return '☀️';
  return '⛅';
}

// Computed property for card darkening based on scroll
const cardsDarkened = computed(() => scrollOffset.value > 100);

// Station change with parallax transition
function changeStation(stationId: string, index: number) {
  if (stationId === selectedStation.value || isTransitioning.value) return;

  // Close navigation
  isNavOpen.value = false;

  // Determine direction based on current vs new station index
  const currentIndex = stations.value.findIndex(s => s.id === selectedStation.value);
  transitionDirection.value = index > currentIndex ? 'right' : 'left';

  // Create different animation patterns based on transition direction and randomness
  const patterns = [
    'spiral-in',      // Cards spiral in from outside
    'cascade-wave',   // Cards come in like a wave
    'radial-burst',   // Cards burst from center outward
    'corner-sweep',   // Cards sweep in from corners
    'zigzag-flow',    // Cards flow in zigzag pattern
    'layered-depth'   // Cards come in with depth layers
  ];
  
  // Select pattern based on station index for consistency but with variation
  cardAnimationPattern.value = patterns[index % patterns.length];
  
  // Add some randomness to stagger delay
  staggerDelay.value = 50 + Math.random() * 100;

  // Start transition
  isTransitioning.value = true;

  // Change station after initial animation
  setTimeout(() => {
    selectedStation.value = stationId;

    // End transition after data loads and animations complete
    setTimeout(() => {
      isTransitioning.value = false;
      
      // Reset and re-trigger card animations
      nextTick(() => {
        cardAnimationPattern.value = 'default';
        // Force cards to re-render with new animations
        cardRefreshKey.value += 1;
        
        // Reset all card animations and re-trigger them
        nextTick(() => {
          resetAndTriggerCardAnimations();
        });
      });
    }, 1500); // Increased for more complex animations
  }, 400);
}

// Function to reset and re-trigger card animations
function resetAndTriggerCardAnimations() {
  const cards = document.querySelectorAll('[data-card-id]');
  
  cards.forEach((card, index) => {
    const htmlCard = card as HTMLElement;
    
    // Remove all animation classes
    htmlCard.classList.remove('card-spiral-in', 'card-cascade-wave', 'card-radial-burst', 
                             'card-corner-sweep', 'card-zigzag-flow', 'card-layered-depth',
                             'card-default-in', 'card-transition-out');
    
    // Remove delay classes
    for (let i = 0; i <= 600; i += 60) {
      htmlCard.classList.remove(`animation-delay-${i}`);
    }
    
    // Force reflow
    htmlCard.offsetHeight;
    
    // Re-add animation classes after a brief delay
    setTimeout(() => {
      const patterns = ['spiral-in', 'cascade-wave', 'radial-burst', 'corner-sweep', 'zigzag-flow', 'layered-depth'];
      const cardPattern = patterns[index % patterns.length];
      const delay = index * 80;
      
      htmlCard.classList.add(`card-${cardPattern}`);
      htmlCard.classList.add(`animation-delay-${Math.min(delay, 500)}`);
    }, 50);
  });
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
  
  // Check if horizontal swipe distance is greater than vertical (avoid interfering with scrolling)
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

function onScroll() {
  const y = window.scrollY || document.documentElement.scrollTop;
  scrollOffset.value = y;
}

// Ionic IonContent scroll handler with parallax
function handleIonScroll(ev: any) {
  const y = ev?.detail?.scrollTop ?? 0;
  scrollOffset.value = y;
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
  if (!currentStation.value || !currentStation.value.data) return '⛅';

  const weatherCondition = determineWeatherCondition(currentStation.value.data);

  // Return emoji based on weather condition
  if (weatherCondition.wType.includes('Intense') || weatherCondition.wType.includes('Torrential')) return '🌊';
  if (weatherCondition.wType.includes('Heavy')) return '🌧️';
  if (weatherCondition.wType.includes('Moderate')) return '🌦️';
  if (weatherCondition.wType.includes('Light Rain')) return '🌧️';
  if (weatherCondition.wType.includes('Cloudy')) return '☁️';
  if (weatherCondition.wType.includes('Partly Cloudy')) return '⛅';
  if (weatherCondition.wType.includes('Sunny')) return '☀️';
  return '⛅';
}

function getWeatherDescription(): string {
  if (!currentStation.value || !currentStation.value.data) return 'Loading weather data...';

  const weatherCondition = determineWeatherCondition(currentStation.value.data);
  return weatherCondition.wType;
}

function determineWeatherCondition(weather: any) {
  const rr = parseFloat(weather['rainfall'] || weather['RR']) || 0;
  // Check all possible LUX field names from your data structure
  const lux = parseFloat(weather['illumination'] || weather['LUX'] || weather['lux']) || 0;



  const intenseRainIcon = '/images/torrential-rain.png';
  const heavyRainIcon = '/images/heavy-intense-rain.png';
  const moderateRainIcon = '/images/moderate-heavy-rain.png';
  const lightRainIcon = '/images/light-rain.png';
  const cloudyIcon = '/images/cloudy-icon.png';
  const partlyCloudyIcon = '/images/partly-cloudy.png';
  const sunnyIcon = '/images/sunny-icon.png';

  let wType = '';
  let condition = '';

  // Determine weather type based on rainfall and light levels
  if (rr > 200) {
    wType = 'Intense to Torrential Rain';
    condition = intenseRainIcon;
  } else if (rr > 100 && rr <= 200) {
    wType = 'Heavy to Intense Rain';
    condition = heavyRainIcon;
  } else if (rr > 50 && rr <= 100) {
    wType = 'Moderate to Heavy Rain';
    condition = moderateRainIcon;
  } else if (rr > 0 && rr <= 50) {
    wType = 'Light Rain';
    condition = lightRainIcon;
  } else if (rr === 0 && lux <= 10000) {
    wType = 'Cloudy';
    condition = cloudyIcon;
  } else if (rr === 0 && lux > 10000 && lux <= 30000) {
    wType = 'Partly Cloudy';
    condition = partlyCloudyIcon;
  } else if (rr === 0 && lux > 30000) {
    wType = 'Sunny';
    condition = sunnyIcon;
  } else {
    // Fallback for any edge case
    wType = 'Unknown';
    condition = cloudyIcon;
  }


  return { condition, wType };
}

function isCloudyWeather(): boolean {
  if (!currentStation.value || !currentStation.value.data) return false;
  const weatherCondition = determineWeatherCondition(currentStation.value.data);
  return weatherCondition.wType.includes('Cloudy');
}

function isRainingWeather(): boolean {
  if (!currentStation.value || !currentStation.value.data) return false;
  const weatherCondition = determineWeatherCondition(currentStation.value.data);
  return weatherCondition.wType.includes('Rain');
}

function getRainIntensity(): string {
  if (!currentStation.value || !currentStation.value.data) return 'none';
  const weatherCondition = determineWeatherCondition(currentStation.value.data);
  if (weatherCondition.wType.includes('Intense')) return 'intense';
  if (weatherCondition.wType.includes('Heavy')) return 'heavy';
  if (weatherCondition.wType.includes('Moderate')) return 'moderate';
  if (weatherCondition.wType.includes('Light')) return 'light';
  return 'none';
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

// Store Firebase listeners for cleanup
const firebaseListeners = ref<(() => void)[]>([]);

function fetchLatestSensors(stationId: string) {
  // Clean up previous listeners first
  firebaseListeners.value.forEach(unsubscribe => {
    try {
      unsubscribe();
    } catch (error) {
      console.warn('Error unsubscribing from Firebase listener:', error);
    }
  });
  firebaseListeners.value = [];

  sensorTypes.forEach(sensor => {
    const sensorRef = dbRef(db, `${stationId}/data/sensors/${sensor.key}`);
    const q = query(sensorRef, orderByKey(), limitToLast(1));

    // Store the unsubscribe function
    const unsubscribe = onChildAdded(q, (snapshot) => {
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

      }
      else if (sensor.key === 'WSP') sensorValues.value.WSP = finalValue;
      else if (sensor.key === 'WD') sensorValues.value.WD = finalValue;
      else if (sensor.key === 'SMD') sensorValues.value.SMD = finalValue;
      else if (sensor.key === 'STD') sensorValues.value.STD = finalValue;
      else if (sensor.key === 'LUX') {
        sensorValues.value.LUX = finalValue;

      }
      else if (sensor.key === 'TSR') sensorValues.value.TSR = finalValue;
      else if (sensor.key === 'WA') sensorValues.value.WA = finalValue;
      else if (sensor.key === 'ATM') sensorValues.value.ATM = finalValue;

      // sensor value updated for key
    });

    // Store the unsubscribe function for cleanup
    firebaseListeners.value.push(unsubscribe);
  });
}

onUnmounted(() => {
  // Clean up Firebase listeners
  firebaseListeners.value.forEach(unsubscribe => {
    try {
      unsubscribe();
    } catch (error) {
      console.warn('Error unsubscribing from Firebase listener on unmount:', error);
    }
  });
  firebaseListeners.value = [];
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

    // Refresh temperature table if available
    try {
      const tempChild: any = temperatureTableRef.value;
      if (tempChild && typeof tempChild.fetchTemperatureData === 'function') {
        tempChild.fetchTemperatureData(selectedStation.value);
      }
    } catch (e) {
      console.warn('Temperature table refresh failed or not available yet', e);
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

        } else {

        }
      }
    });

    // Log completion after a short delay to see the final result
    setTimeout(() => {

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

// Interactive mouse effects
const mouseX = ref(0);
const mouseY = ref(0);
const scrollProgress = ref(0);

// Throttle function for performance
function throttle(func: Function, delay: number) {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;

  return function (...args: any[]) {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func.apply(null, args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(null, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

// Mouse movement handler for basic mouse tracking
const handleMouseMove = throttle((event: MouseEvent) => {
  const { clientX, clientY } = event;
  const { innerWidth, innerHeight } = window;

  mouseX.value = (clientX / innerWidth - 0.5) * 20;
  mouseY.value = (clientY / innerHeight - 0.5) * 20;
}, 16); // ~60fps

// Interactive scroll handler for parallax effects
const handleScroll = throttle(() => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight - windowHeight;

  scrollProgress.value = Math.min(scrollTop / documentHeight, 1);
}, 16); // ~60fps throttle

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

// Dynamic animation classes based on pattern and card position
const getCardAnimationClass = computed(() => {
  return (cardIndex: number, baseClass: string = '') => {
    if (isTransitioning.value) {
      return `${baseClass} card-transition-out`;
    }
    
    // Each card gets a different animation pattern based on its index
    // This creates the multi-directional effect where cards come from different directions
    const patterns = ['spiral-in', 'cascade-wave', 'radial-burst', 'corner-sweep', 'zigzag-flow', 'layered-depth'];
    const cardPattern = patterns[cardIndex % patterns.length];
    const delay = cardIndex * 80; // Stagger delay for each card
    
    // Use the pattern for the specific card
    const animationClass = `card-${cardPattern}`;
    const delayClass = `animation-delay-${Math.min(delay, 500)}`;
    
    // Include the refresh key to force re-computation
    const refreshTrigger = cardRefreshKey.value;
    
    return `${baseClass} ${animationClass} ${delayClass}`;
  };
});

// Watch for weather condition changes to update rain
watch(() => {
  if (currentStation.value) {
    return getRainIntensity();
  }
  return 'none';
}, (newIntensity) => {
  // Rain intensity changes are now handled by the RainAnimation component
}, { immediate: false });

onMounted(async () => {
  // Fetch initial data first
  fetchLatestSensors(selectedStation.value);
  fetchTodayRainfallTotal(selectedStation.value);

  // Add keyboard event listener for navigation
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isNavOpen.value) {
      closeNav();
    }
  };
  document.addEventListener('keydown', handleKeydown);

  if (window.L) {
    try {
      // Dynamically import ExtraMarkers JS
      await import('leaflet-extra-markers/dist/js/leaflet.extra-markers.min.js');
    } catch (error) {
      // ExtraMarkers not available, using default markers
    }
  }

  // Initialize parallax scroll effects and interactive animations
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('mousemove', handleMouseMove, { passive: true });

  // Initialize intersection observer for card animations
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: [0, 0.25, 0.5, 0.75, 1]
  };

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const card = entry.target as HTMLElement;
      if (entry.isIntersecting) {
        card.classList.add('in-view');
        card.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease';
      } else {
        card.classList.remove('in-view');
      }
    });
  }, observerOptions);

  // Observe all cards for intersection
  setTimeout(() => {
    document.querySelectorAll('.card-hover').forEach(card => {
      cardObserver.observe(card);
    });
  }, 200);

  // Store the cleanup function for onUnmounted
  const cleanup = () => {
    document.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('mousemove', handleMouseMove);
    cardObserver.disconnect();
  };

  // Set up cleanup
});
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

/* Hero section transition animations */
@keyframes heroSlideOutLeft {
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }

  100% {
    transform: translateX(-50vw) scale(0.9);
    opacity: 0;
  }
}

@keyframes heroSlideOutRight {
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }

  100% {
    transform: translateX(50vw) scale(0.9);
    opacity: 0;
  }
}

@keyframes heroSlideInLeft {
  0% {
    transform: translateX(50vw) scale(0.9);
    opacity: 0;
  }

  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes heroSlideInRight {
  0% {
    transform: translateX(-50vw) scale(0.9);
    opacity: 0;
  }

  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

/* Hero transition classes */
.hero-transition-out-left {
  animation: heroSlideOutLeft 0.5s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
}

.hero-transition-out-right {
  animation: heroSlideOutRight 0.5s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
}

.hero-transition-in {
  animation: heroSlideInLeft 0.7s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
}

/* Individual card animations from different directions */
@keyframes cardFromTop {
  0% {
    transform: translateY(-100vh) scale(0.8);
    opacity: 0;
  }

  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes cardFromLeft {
  0% {
    transform: translateX(-100vw) scale(0.8);
    opacity: 0;
  }

  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes cardFromRight {
  0% {
    transform: translateX(100vw) scale(0.8);
    opacity: 0;
  }

  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes cardFromBottom {
  0% {
    transform: translateY(100vh) scale(0.8);
    opacity: 0;
  }

  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes cardFromTopLeft {
  0% {
    transform: translate(-70vw, -70vh) scale(0.8) rotate(-15deg);
    opacity: 0;
  }

  100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes cardFromTopRight {
  0% {
    transform: translate(70vw, -70vh) scale(0.8) rotate(15deg);
    opacity: 0;
  }

  100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes cardFromBottomLeft {
  0% {
    transform: translate(-70vw, 70vh) scale(0.8) rotate(15deg);
    opacity: 0;
  }

  100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes cardFromBottomRight {
  0% {
    transform: translate(70vw, 70vh) scale(0.8) rotate(-15deg);
    opacity: 0;
  }

  100% {
    transform: translate(0, 0) scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Card direction classes with staggered delays */
.card-from-top {
  animation: cardFromTop 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
  animation-delay: 0.1s;
  opacity: 0;
}

.card-from-left {
  animation: cardFromLeft 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
  animation-delay: 0.2s;
  opacity: 0;
}

.card-from-right {
  animation: cardFromRight 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
  animation-delay: 0.25s;
  opacity: 0;
}

.card-from-bottom {
  animation: cardFromBottom 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
  animation-delay: 0.3s;
  opacity: 0;
}

.card-from-top-left {
  animation: cardFromTopLeft 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
  animation-delay: 0.35s;
  opacity: 0;
}

.card-from-top-right {
  animation: cardFromTopRight 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
  animation-delay: 0.4s;
  opacity: 0;
}

.card-from-bottom-left {
  animation: cardFromBottomLeft 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
  animation-delay: 0.45s;
  opacity: 0;
}

.card-from-bottom-right {
  animation: cardFromBottomRight 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
  animation-delay: 0.5s;
  opacity: 0;
}

/* Enhanced Animation Patterns */
@keyframes spiralIn {
  0% {
    transform: translateX(-200px) translateY(-200px) rotate(-360deg) scale(0.1);
    opacity: 0;
  }
  50% {
    transform: translateX(-100px) translateY(-100px) rotate(-180deg) scale(0.5);
    opacity: 0.7;
  }
  100% {
    transform: translateX(0) translateY(0) rotate(0deg) scale(1);
    opacity: 1;
  }
}

@keyframes cascadeWave {
  0% {
    transform: translateY(-100px) rotateX(90deg);
    opacity: 0;
  }
  30% {
    transform: translateY(-50px) rotateX(45deg);
    opacity: 0.5;
  }
  70% {
    transform: translateY(10px) rotateX(-10deg);
    opacity: 0.9;
  }
  100% {
    transform: translateY(0) rotateX(0deg);
    opacity: 1;
  }
}

@keyframes radialBurst {
  0% {
    transform: scale(0) rotate(180deg);
    opacity: 0;
    filter: blur(10px);
  }
  50% {
    transform: scale(1.1) rotate(90deg);
    opacity: 0.8;
    filter: blur(2px);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
    filter: blur(0px);
  }
}

@keyframes cornerSweep {
  0% {
    transform: translateX(-150px) translateY(-150px) rotate(-90deg) scale(0.3);
    opacity: 0;
  }
  40% {
    transform: translateX(-75px) translateY(-75px) rotate(-45deg) scale(0.7);
    opacity: 0.6;
  }
  100% {
    transform: translateX(0) translateY(0) rotate(0deg) scale(1);
    opacity: 1;
  }
}

@keyframes zigzagFlow {
  0% {
    transform: translateX(-300px) translateY(0) skewX(30deg);
    opacity: 0;
  }
  25% {
    transform: translateX(-150px) translateY(-30px) skewX(15deg);
    opacity: 0.3;
  }
  50% {
    transform: translateX(-75px) translateY(15px) skewX(-15deg);
    opacity: 0.6;
  }
  75% {
    transform: translateX(-25px) translateY(-10px) skewX(5deg);
    opacity: 0.9;
  }
  100% {
    transform: translateX(0) translateY(0) skewX(0deg);
    opacity: 1;
  }
}

@keyframes layeredDepth {
  0% {
    transform: translateZ(-500px) scale(0.2) rotateY(45deg);
    opacity: 0;
    filter: blur(15px);
  }
  30% {
    transform: translateZ(-300px) scale(0.5) rotateY(30deg);
    opacity: 0.4;
    filter: blur(8px);
  }
  70% {
    transform: translateZ(-100px) scale(0.8) rotateY(10deg);
    opacity: 0.8;
    filter: blur(3px);
  }
  100% {
    transform: translateZ(0) scale(1) rotateY(0deg);
    opacity: 1;
    filter: blur(0px);
  }
}

/* Enhanced Animation Classes */
.card-spiral-in {
  animation: spiralIn 1.2s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  opacity: 0;
}

.card-cascade-wave {
  animation: cascadeWave 1.0s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  opacity: 0;
}

.card-radial-burst {
  animation: radialBurst 0.9s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
  opacity: 0;
}

.card-corner-sweep {
  animation: cornerSweep 1.1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  opacity: 0;
}

.card-zigzag-flow {
  animation: zigzagFlow 1.3s cubic-bezier(0.39, 0.575, 0.565, 1) forwards;
  opacity: 0;
}

.card-layered-depth {
  animation: layeredDepth 1.4s cubic-bezier(0.19, 1, 0.22, 1) forwards;
  opacity: 0;
  perspective: 1000px;
}

.card-default-in {
  animation: cardFromTop 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
  opacity: 0;
}

.card-transition-out {
  animation: fadeOut 0.4s ease-out forwards;
}

/* Animation Delay Classes */
.animation-delay-0 { animation-delay: 0ms; }
.animation-delay-60 { animation-delay: 60ms; }
.animation-delay-80 { animation-delay: 80ms; }
.animation-delay-90 { animation-delay: 90ms; }
.animation-delay-100 { animation-delay: 100ms; }
.animation-delay-110 { animation-delay: 110ms; }
.animation-delay-120 { animation-delay: 120ms; }
.animation-delay-200 { animation-delay: 200ms; }
.animation-delay-300 { animation-delay: 300ms; }
.animation-delay-400 { animation-delay: 400ms; }
.animation-delay-450 { animation-delay: 450ms; }
.animation-delay-500 { animation-delay: 500ms; }
.animation-delay-550 { animation-delay: 550ms; }
.animation-delay-600 { animation-delay: 600ms; }

@keyframes fadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

/* Station Transition Parallax Effects */
@keyframes stationSlideOutLeft {
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }

  100% {
    transform: translateX(-100vw) scale(0.8);
    opacity: 0;
  }
}

@keyframes stationSlideOutRight {
  0% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }

  100% {
    transform: translateX(100vw) scale(0.8);
    opacity: 0;
  }
}

@keyframes stationSlideInLeft {
  0% {
    transform: translateX(100vw) scale(0.8);
    opacity: 0;
  }

  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

@keyframes stationSlideInRight {
  0% {
    transform: translateX(-100vw) scale(0.8);
    opacity: 0;
  }

  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

/* Card-specific parallax animations with staggered delays */
@keyframes cardsSlideOutLeft {
  0% {
    transform: translateX(0) translateY(0) scale(1);
    opacity: 1;
  }

  100% {
    transform: translateX(-50vw) translateY(-20px) scale(0.9);
    opacity: 0;
  }
}

@keyframes cardsSlideOutRight {
  0% {
    transform: translateX(0) translateY(0) scale(1);
    opacity: 1;
  }

  100% {
    transform: translateX(50vw) translateY(-20px) scale(0.9);
    opacity: 0;
  }
}

@keyframes cardsSlideInLeft {
  0% {
    transform: translateX(50vw) translateY(20px) scale(0.9);
    opacity: 0;
  }

  100% {
    transform: translateX(0) translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes cardsSlideInRight {
  0% {
    transform: translateX(-50vw) translateY(20px) scale(0.9);
    opacity: 0;
  }

  100% {
    transform: translateX(0) translateY(0) scale(1);
    opacity: 1;
  }
}

/* Station transition classes */
.station-transition-out-left {
  animation: stationSlideOutLeft 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
}

.station-transition-out-right {
  animation: stationSlideOutRight 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
}

.station-transition-in {
  animation: stationSlideInLeft 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
}

/* Cards transition classes with staggered effects */
.cards-transition-out-left {
  animation: cardsSlideOutLeft 0.5s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
}

.cards-transition-out-right {
  animation: cardsSlideOutRight 0.5s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
}

.cards-transition-in {
  animation: cardsSlideInLeft 0.8s cubic-bezier(0.0, 0.0, 0.2, 1) forwards;
}

.cards-transition-in>* {
  animation-delay: calc(var(--card-index, 0) * 0.05s);
}

/* Individual card animations for more dynamic effect */
.cards-transition-in>*:nth-child(1) {
  animation-delay: 0.1s;
}

.cards-transition-in>*:nth-child(2) {
  animation-delay: 0.15s;
}

.cards-transition-in>*:nth-child(3) {
  animation-delay: 0.2s;
}

.cards-transition-in>*:nth-child(4) {
  animation-delay: 0.25s;
}

.cards-transition-in>*:nth-child(5) {
  animation-delay: 0.3s;
}

.cards-transition-in>*:nth-child(6) {
  animation-delay: 0.35s;
}

.cards-transition-in>*:nth-child(7) {
  animation-delay: 0.4s;
}

.cards-transition-in>*:nth-child(8) {
  animation-delay: 0.45s;
}

/* Fix scrolling issues and improve mobile performance */
.min-h-screen {
  min-height: 100vh;
  min-height: 100dvh;
  /* Dynamic viewport height for mobile */
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
  h1 {
    font-size: 1.875rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  h3 {
    font-size: 1.125rem;
  }

  /* Improve touch targets */
  button,
  a,
  [role="button"] {
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

/* Interactive Parallax & Scroll Effects */
.card-hover {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  will-change: transform, opacity;
  --mouse-x: 0px;
  --mouse-y: 0px;
  position: relative;
  overflow: hidden;
}

.card-hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: -1;
}

.card-hover.in-view {
  transform: translateY(0) translateX(var(--mouse-x)) translateY(var(--mouse-y)) scale(1) !important;
  opacity: 1 !important;
}

.card-hover:hover {
  transform: translateY(-8px) translateX(var(--mouse-x)) translateY(var(--mouse-y)) scale(1.03) !important;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.3), 0 0 30px rgba(59, 130, 246, 0.1) !important;
  border-color: rgba(59, 130, 246, 0.3) !important;
}

.card-hover:hover::before {
  opacity: 1;
}

/* Interactive scroll animations */
@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card-hover:nth-child(odd) {
  animation: cardSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.card-hover:nth-child(even) {
  animation: cardSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards;
}

/* Enhanced parallax background effects */
@keyframes parallaxFloat {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  50% {
    transform: translateY(-10px) rotate(1deg);
  }
}

.parallax-element {
  animation: parallaxFloat 6s ease-in-out infinite;
}

/* Scroll progress indicator */
.scroll-progress {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
  background-size: 200% 100%;
  animation: gradientShift 3s ease-in-out infinite;
}

@keyframes gradientShift {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
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

/* Temperature Card to Table Transformation Styles */
.transform-to-table {
  position: relative;
  overflow: hidden;
  border-color: rgba(59, 130, 246, 0.5) !important;
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.3) !important;
}

.transform-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(16, 185, 129, 0.1));
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: transformOverlay 0.8s ease-in-out;
}

/* Reverse transformation when closing */
.transform-overlay.reverse {
  animation: transformOverlayReverse 0.6s ease-in-out;
}

.transform-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(59, 130, 246, 0.8);
  border-radius: 50%;
  animation: particleFloat 2s infinite ease-in-out;
}

/* Reverse particle animation */
.transform-overlay.reverse .particle {
  animation: particleFloatReverse 0.6s ease-in-out;
}

.particle:nth-child(1) {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.particle:nth-child(2) {
  top: 15%;
  left: 80%;
  animation-delay: 0.1s;
}

.particle:nth-child(3) {
  top: 40%;
  left: 15%;
  animation-delay: 0.2s;
}

.particle:nth-child(4) {
  top: 60%;
  left: 85%;
  animation-delay: 0.3s;
}

.particle:nth-child(5) {
  top: 80%;
  left: 25%;
  animation-delay: 0.4s;
}

.particle:nth-child(6) {
  top: 75%;
  left: 75%;
  animation-delay: 0.5s;
}

.particle:nth-child(7) {
  top: 30%;
  left: 50%;
  animation-delay: 0.6s;
}

.particle:nth-child(8) {
  top: 50%;
  left: 60%;
  animation-delay: 0.7s;
}

.particle:nth-child(9) {
  top: 25%;
  left: 40%;
  animation-delay: 0.8s;
}

.particle:nth-child(10) {
  top: 65%;
  left: 30%;
  animation-delay: 0.9s;
}

.particle:nth-child(11) {
  top: 85%;
  left: 55%;
  animation-delay: 1.0s;
}

.particle:nth-child(12) {
  top: 45%;
  left: 70%;
  animation-delay: 1.1s;
}

.transform-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: white;
  text-align: center;
  z-index: 2;
  animation: transformText 0.8s ease-in-out;
}

.transform-text.reverse {
  animation: transformTextReverse 0.6s ease-in-out;
}

.transform-icon {
  width: 2rem;
  height: 2rem;
  color: #3b82f6;
  animation: iconPulse 1s infinite ease-in-out;
}

.transform-text span {
  font-size: 0.875rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

@keyframes transformOverlay {
  0% {
    opacity: 0;
    backdrop-filter: blur(0px);
  }

  50% {
    opacity: 1;
    backdrop-filter: blur(8px);
  }

  100% {
    opacity: 0.8;
    backdrop-filter: blur(6px);
  }
}

@keyframes transformOverlayReverse {
  0% {
    opacity: 0.8;
    backdrop-filter: blur(6px);
  }

  50% {
    opacity: 1;
    backdrop-filter: blur(8px);
  }

  100% {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
}

@keyframes particleFloat {

  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }

  50% {
    transform: translateY(-10px) scale(1.2);
    opacity: 1;
  }
}

@keyframes particleFloatReverse {
  0% {
    transform: translateY(-10px) scale(1.2);
    opacity: 1;
  }

  100% {
    transform: translateY(0) scale(0.5);
    opacity: 0;
  }
}

@keyframes transformText {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.9);
  }

  50% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes transformTextReverse {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  100% {
    opacity: 0;
    transform: translateY(-10px) scale(0.8);
  }
}

@keyframes iconPulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }

  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}
</style>
