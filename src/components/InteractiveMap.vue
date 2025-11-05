<template>
  <IonModal ref="mapModal" :is-open="isOpen" @willDismiss="handleDismiss">
    <IonHeader class="ion-no-border">
      <IonToolbar class="simple-modern-toolbar">
        <IonTitle class="simple-modern-title">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span class="text-lg">🗺️</span>
            </div>
            <div>
              <h1 class="text-lg font-semibold text-white">Weather Stations</h1>
              <p class="text-xs text-white/70">{{ stations.length }} stations</p>
            </div>
          </div>
        </IonTitle>

        <IonButtons slot="end">
          <IonButton @click="closeModal" class="simple-close-button">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
    
    <IonContent class="bg-gray-100">
      <!-- Map Container -->
      <div class="w-full h-full relative overflow-hidden" @click="closeDropdownOnMapClick">
        <div ref="mapContainer" id="interactive-weather-map" class="w-full h-full"></div>
        
        <!-- Map Controls Panel - Fixed positioning to prevent disappearing -->
        <div class="absolute top-4 left-4 z-[1000] flex flex-col gap-3 max-w-[280px]">
          <!-- Modern Layer Toggle Button -->
          <div class="relative" ref="layerDropdownRef">
            <button 
              @click.stop="toggleLayerDropdown"
              type="button"
              class="group w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 px-4 py-3.5 transition-all duration-300 hover:shadow-xl hover:bg-white flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                  </svg>
                </div>
                <div class="text-left">
                  <div class="text-xs font-medium text-gray-500">Map Style</div>
                  <div class="text-sm font-bold text-gray-900">{{ currentLayer.name }}</div>
                </div>
              </div>
              <svg 
                class="w-5 h-5 text-gray-400 transition-transform duration-300" 
                :class="{ 'rotate-180': isLayerDropdownOpen }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            
            <!-- Modern Dropdown Menu with Transition -->
            <transition name="dropdown">
              <div 
                v-if="isLayerDropdownOpen"
                @click.stop
                class="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden z-[1001]">
                <div class="p-2">
                  <button 
                    v-for="layer in mapLayers" 
                    :key="layer.name"
                    type="button"
                    @click.stop="changeMapLayer(layer)"
                    :class="[
                      'w-full px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-200 flex items-center justify-between group',
                      currentLayer.name === layer.name
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    ]">
                    <span>{{ layer.name }}</span>
                    <svg 
                      v-if="currentLayer.name === layer.name"
                      class="w-5 h-5 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                    <svg 
                      v-else
                      class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </transition>
          </div>

          <!-- Modern Station Info Panel -->
          <transition name="slide-fade">
            <div v-if="selectedMapStation" class="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden max-h-[calc(100vh-200px)]">
              <!-- Station Header -->
              <div class="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-5 text-white">
                <button 
                  @click="selectedMapStation = null" 
                  type="button"
                  class="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
                
                <div class="flex items-start gap-3 pr-8">
                  <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl">
                    {{ getWeatherIcon(selectedMapStation.data) }}
                  </div>
                  <div>
                    <h3 class="text-lg font-bold mb-1">{{ selectedMapStation.name }}</h3>
                    <div class="flex items-center gap-2 text-white/80 text-xs">
                      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                      </svg>
                      <span>{{ selectedMapStation.lat.toFixed(4) }}, {{ selectedMapStation.lng.toFixed(4) }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Weather Metrics -->
              <div v-if="selectedMapStation.data" class="p-4">
                <div class="grid grid-cols-2 gap-3 mb-4">
                  <!-- Temperature Card -->
                  <div class="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100 hover:shadow-lg transition-all duration-300">
                    <div class="absolute top-0 right-0 w-16 h-16 bg-orange-200/30 rounded-full -mr-8 -mt-8"></div>
                    <div class="relative">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-2xl">🌡️</span>
                        <span class="text-xs font-medium text-orange-600 uppercase tracking-wide">Temp</span>
                      </div>
                      <div class="text-2xl font-bold text-orange-700">{{ selectedMapStation.data.temperature }}<span class="text-sm">°C</span></div>
                      <div class="text-xs text-orange-600 mt-1">Temperature</div>
                    </div>
                  </div>

                  <!-- Humidity Card -->
                  <div class="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100 hover:shadow-lg transition-all duration-300">
                    <div class="absolute top-0 right-0 w-16 h-16 bg-blue-200/30 rounded-full -mr-8 -mt-8"></div>
                    <div class="relative">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-2xl">💧</span>
                        <span class="text-xs font-medium text-blue-600 uppercase tracking-wide">Humid</span>
                      </div>
                      <div class="text-2xl font-bold text-blue-700">{{ selectedMapStation.data.humidity }}<span class="text-sm">%</span></div>
                      <div class="text-xs text-blue-600 mt-1">Humidity</div>
                    </div>
                  </div>

                  <!-- Wind Speed Card -->
                  <div class="group relative overflow-hidden bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-100 hover:shadow-lg transition-all duration-300">
                    <div class="absolute top-0 right-0 w-16 h-16 bg-teal-200/30 rounded-full -mr-8 -mt-8"></div>
                    <div class="relative">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-2xl">💨</span>
                        <span class="text-xs font-medium text-teal-600 uppercase tracking-wide">Wind</span>
                      </div>
                      <div class="text-2xl font-bold text-teal-700">{{ selectedMapStation.data.windSpeed }}<span class="text-sm">m/s</span></div>
                      <div class="text-xs text-teal-600 mt-1">Wind Speed</div>
                    </div>
                  </div>

                  <!-- Rainfall Card -->
                  <div class="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100 hover:shadow-lg transition-all duration-300">
                    <div class="absolute top-0 right-0 w-16 h-16 bg-indigo-200/30 rounded-full -mr-8 -mt-8"></div>
                    <div class="relative">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-2xl">🌧️</span>
                        <span class="text-xs font-medium text-indigo-600 uppercase tracking-wide">Rain</span>
                      </div>
                      <div class="text-2xl font-bold text-indigo-700">{{ selectedMapStation.data.rainfall }}<span class="text-sm">mm</span></div>
                      <div class="text-xs text-indigo-600 mt-1">Rainfall</div>
                    </div>
                  </div>
                </div>
                
                <!-- Action Button -->
                <button 
                  @click="selectStationAndClose(selectedMapStation.id)"
                  type="button"
                  class="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  Switch to This Station
                </button>
              </div>
            </div>
          </transition>
        </div>

          <!-- Map Legend - Fixed positioning -->
        <div class="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-[12px] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 p-4 min-w-[140px]">
          <div class="text-sm font-semibold text-gray-800 mb-3">Legend</div>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-emerald-500 rounded-full flex-shrink-0 animate-pulse"></div>
              <span class="text-xs text-gray-700 font-medium">Active Station</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span class="text-xs text-gray-700 font-medium">Available Station</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-red-500 rounded-full flex-shrink-0 animate-pulse"></div>
              <span class="text-xs text-gray-700 font-medium">Your Location</span>
            </div>
          </div>
        </div>        <!-- Loading Overlay -->
        <div v-if="isMapLoading" class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[2000]">
          <div class="bg-white rounded-2xl p-6 flex items-center gap-3 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div class="w-6 h-6 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            <span class="text-gray-700 font-semibold text-sm">Loading map...</span>
          </div>
        </div>
      </div>
    </IonContent>
  </IonModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonContent } from '@ionic/vue';
import { Geolocation } from '@capacitor/geolocation';

// @ts-ignore
declare global { interface Window { L: any } }

interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  data?: any;
}

interface MapLayer {
  name: string;
  url: string;
  attribution: string;
}

// Props
interface Props {
  isOpen: boolean;
  stations: Station[];
  currentStation: Station | null;
  selectedStation: string;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  close: [];
  stationSelected: [stationId: string];
}>();

// Reactive state
const mapModal = ref();
const mapContainer = ref<HTMLElement>();
const isMapLoading = ref(true);
const selectedMapStation = ref<Station | null>(null);
const userLocation = ref<{ lat: number; lng: number } | null>(null);
const userLocationMarker = ref<any>(null);
const isLayerDropdownOpen = ref(false);

// Map instances
let map: any = null;
let currentBaseLayer: any = null; // Track current base layer
const markerMap: { [key: string]: any } = {};
let weatherLayer: any = null;
let locationWatchId: string | null = null; // For real-time location tracking

// Map layers configuration
const mapLayers = ref<MapLayer[]>([
  {
    name: 'Street',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
  },
  {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri'
  },
  {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap contributors'
  }
]);

const currentLayer = ref(mapLayers.value[0]);

// Methods
function handleDismiss() {
  emit('close');
}

function closeModal() {
  emit('close');
}

function selectStationAndClose(stationId: string) {
  emit('stationSelected', stationId);
  emit('close');
}

function toggleLayerDropdown() {
  isLayerDropdownOpen.value = !isLayerDropdownOpen.value;
}

function closeDropdownOnMapClick() {
  if (isLayerDropdownOpen.value) {
    isLayerDropdownOpen.value = false;
  }
}

function changeMapLayer(layer: MapLayer) {
  if (!map) return;
  
  currentLayer.value = layer;
  isLayerDropdownOpen.value = false; // Close dropdown after selection
  
  // Remove current base layer if it exists
  if (currentBaseLayer) {
    map.removeLayer(currentBaseLayer);
  }
  
  // Add new base layer and store reference
  currentBaseLayer = window.L.tileLayer(layer.url, {
    attribution: layer.attribution,
    maxZoom: 18,
    isOverlay: false
  }).addTo(map);
}

function getWeatherIcon(stationData: any): string {
  if (!stationData) return '⛅';
  
  const rainfall = stationData.rainfall || 0;
  const lux = stationData.illumination || 0;
  
  // Detailed weather conditions based on rainfall and illumination
  if (rainfall > 200) {
    return '⛈️'; // Intense to Torrential Rain
  } else if (rainfall > 100 && rainfall <= 200) {
    return '🌧️'; // Heavy to Intense Rain
  } else if (rainfall > 50 && rainfall <= 100) {
    return '🌧️'; // Moderate to Heavy Rain
  } else if (rainfall > 0 && rainfall <= 50) {
    return '🌦️'; // Light Rain
  } else if (rainfall === 0 && lux <= 2000) {
    return '☁️'; // Cloudy
  } else if (rainfall === 0 && lux > 2000 && lux <= 3000) {
    return '⛅'; // Partly Cloudy
  } else if (rainfall === 0 && lux > 3000) {
    return '☀️'; // Sunny
  } else {
    // Fallback for any edge case
    return '⛅';
  }
}

function createCustomMarker(station: Station, isActive: boolean = false) {
  if (!window.L) return null;
  
  const weatherIcon = getWeatherIcon(station.data);
  const temperature = station.data?.temperature || 0;
  
  // Create custom marker HTML
  const markerHtml = `
    <div class="custom-marker ${isActive ? 'active' : ''}" data-station="${station.id}">
      <div class="marker-pin ${isActive ? 'active-pin' : ''}">
        <div class="marker-icon">${weatherIcon}</div>
        <div class="marker-temp">${temperature}°C</div>
      </div>
      <div class="marker-pulse ${isActive ? 'active-pulse' : ''}"></div>
    </div>
  `;
  
  const icon = window.L.divIcon({
    html: markerHtml,
    className: 'custom-marker-container',
    iconSize: [60, 80],
    iconAnchor: [30, 70],
    popupAnchor: [0, -70]
  });
  
  const marker = window.L.marker([station.lat, station.lng], { icon })
    .addTo(map);
  
  // Add click event
  marker.on('click', () => {
    selectedMapStation.value = station;
    map.setView([station.lat, station.lng], 12, { animate: true });
  });
  
  // Add hover events
  marker.on('mouseover', () => {
    marker.openPopup();
  });
  
  // Create enhanced popup
  const popupContent = `
    <div class="station-popup">
      <div class="popup-header">
        <span class="popup-icon">${weatherIcon}</span>
        <div class="popup-title">${station.name}</div>
      </div>
      ${station.data ? `
        <div class="popup-data">
          <div class="data-item">
            <span class="data-label">Temperature:</span>
            <span class="data-value">${station.data.temperature}°C</span>
          </div>
          <div class="data-item">
            <span class="data-label">Humidity:</span>
            <span class="data-value">${station.data.humidity}%</span>
          </div>
        </div>
      ` : ''}
      <div class="popup-coords">${station.lat.toFixed(4)}, ${station.lng.toFixed(4)}</div>
    </div>
  `;
  
  marker.bindPopup(popupContent, {
    closeButton: false,
    offset: [0, -10],
    className: 'custom-popup'
  });
  
  return marker;
}

async function getUserLocation() {
  try {
    const permissions = await Geolocation.checkPermissions();
    
    if (permissions.location === 'denied') {
      const requestPermissions = await Geolocation.requestPermissions();
      if (requestPermissions.location === 'denied') {
        console.warn('Location permission denied');
        return null;
      }
    }
    
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
    
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
  } catch (error) {
    console.error('Error getting user location:', error);
    return null;
  }
}

async function startLocationTracking() {
  try {
    const permissions = await Geolocation.checkPermissions();
    
    if (permissions.location === 'denied') {
      const requestPermissions = await Geolocation.requestPermissions();
      if (requestPermissions.location === 'denied') {
        console.warn('Location permission denied');
        return;
      }
    }
    
    // Get initial position
    const initialPosition = await getUserLocation();
    if (initialPosition) {
      userLocation.value = initialPosition;
      addUserLocationMarker(initialPosition);
    }
    
    // Start watching position for real-time updates
    locationWatchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      },
      (position, err) => {
        if (err) {
          console.error('Error watching position:', err);
          return;
        }
        
        if (position) {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          userLocation.value = newLocation;
          updateUserLocationMarker(newLocation);
        }
      }
    );
  } catch (error) {
    console.error('Error starting location tracking:', error);
  }
}

function stopLocationTracking() {
  if (locationWatchId) {
    Geolocation.clearWatch({ id: locationWatchId });
    locationWatchId = null;
  }
}

function addUserLocationMarker(location: { lat: number; lng: number }) {
  if (!map || !window.L) return;
  
  // Remove existing user location marker if it exists
  if (userLocationMarker.value) {
    map.removeLayer(userLocationMarker.value);
  }
  
  // Create custom user location marker HTML
  const markerHtml = `
    <div class="user-location-marker">
      <div class="user-location-pin">
        <div class="user-location-icon">📍</div>
      </div>
      <div class="user-location-pulse"></div>
    </div>
  `;
  
  const icon = window.L.divIcon({
    html: markerHtml,
    className: 'user-location-container',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
  
  userLocationMarker.value = window.L.marker([location.lat, location.lng], { icon })
    .addTo(map)
    .bindPopup(`
      <div class="user-location-popup">
        <div class="popup-header">
          <span class="popup-icon">📍</span>
          <div class="popup-title">Your Location</div>
        </div>
        <div class="popup-coords">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</div>
      </div>
    `, {
      closeButton: false,
      offset: [0, -10],
      className: 'custom-popup'
    });
  
  // Add accuracy circle
  window.L.circle([location.lat, location.lng], {
    color: '#3b82f6',
    fillColor: '#3b82f6',
    fillOpacity: 0.1,
    radius: 100,
    weight: 1
  }).addTo(map);
}

function updateUserLocationMarker(location: { lat: number; lng: number }) {
  if (!map || !window.L) return;
  
  if (userLocationMarker.value) {
    // Update existing marker position with smooth animation
    userLocationMarker.value.setLatLng([location.lat, location.lng]);
    
    // Update popup content
    userLocationMarker.value.setPopupContent(`
      <div class="user-location-popup">
        <div class="popup-header">
          <span class="popup-icon">📍</span>
          <div class="popup-title">Your Location</div>
        </div>
        <div class="popup-coords">${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</div>
      </div>
    `);
  } else {
    // If marker doesn't exist, create it
    addUserLocationMarker(location);
  }
}

function initializeMap() {
  if (!window.L || !mapContainer.value) return;
  
  isMapLoading.value = true;
  
  try {
    // Create map
    map = window.L.map('interactive-weather-map', {
      zoomControl: false,
      attributionControl: false
    }).setView([13.2, 121.1], 9);
    
    // Add custom zoom control
    window.L.control.zoom({ position: 'bottomleft' }).addTo(map);
    
    // Add attribution control
    window.L.control.attribution({ 
      position: 'bottomright',
      prefix: false 
    }).addTo(map);
    
    // Add base layer
    changeMapLayer(currentLayer.value);
    
    // Add station markers
    updateMarkers();
    
    // Start real-time location tracking
    startLocationTracking();
    
    // Map loaded
    map.whenReady(() => {
      isMapLoading.value = false;
    });
    
  } catch (error) {
    console.error('Error initializing map:', error);
    isMapLoading.value = false;
  }
}

function updateMarkers() {
  if (!map) return;
  
  // Clear existing markers
  Object.values(markerMap).forEach((marker: any) => {
    if (marker) map.removeLayer(marker);
  });
  
  // Add new markers
  props.stations.forEach(station => {
    const isActive = station.id === props.selectedStation;
    const marker = createCustomMarker(station, isActive);
    if (marker) {
      markerMap[station.id] = marker;
    }
  });
  
  // Center on active station
  if (props.currentStation) {
    map.setView([props.currentStation.lat, props.currentStation.lng], 10, { animate: true });
  }
}

function cleanupMap() {
  // Stop location tracking
  stopLocationTracking();
  
  if (map) {
    try {
      map.remove();
      map = null;
    } catch (error) {
      console.warn('Error cleaning up map:', error);
    }
  }
  
  // Clear references
  currentBaseLayer = null;
  weatherLayer = null;
  userLocationMarker.value = null;
  userLocation.value = null;
  isLayerDropdownOpen.value = false;
  
  // Clear markers
  Object.keys(markerMap).forEach(key => {
    delete markerMap[key];
  });
}

// Watchers
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      setTimeout(() => {
        initializeMap();
      }, 300);
    });
  } else {
    cleanupMap();
    selectedMapStation.value = null;
  }
});

// Only watch station count changes or additions/removals, not data updates
watch(() => props.stations.length, () => {
  if (map) {
    updateMarkers();
  }
});

// Only update markers when selected station changes
watch(() => props.selectedStation, () => {
  if (map) {
    updateMarkers();
  }
});

onUnmounted(() => {
  cleanupMap();
});
</script>

<style scoped>
.simple-modern-toolbar {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --color: white;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  --min-height: 64px;
}

.simple-modern-title {
  --color: white;
}

.simple-close-button {
  --background: rgba(255, 255, 255, 0.1);
  --background-hover: rgba(255, 255, 255, 0.2);
  --background-activated: rgba(255, 255, 255, 0.15);
  --color: white;
  --border-radius: 8px;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 8px;
  --padding-bottom: 8px;
  --ripple-color: rgba(255, 255, 255, 0.3);
}

/* Remove old styles */
.modern-map-toolbar {
  --background: transparent;
  --color: white;
  --padding-start: 20px;
  --padding-end: 20px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  --min-height: 80px;
}

.modern-map-title {
  --color: white;
  text-align: left;
}

.modern-close-button {
  --background: transparent;
  --background-hover: transparent;
  --background-activated: transparent;
  --color: white;
  --border-radius: 12px;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  --ripple-color: rgba(255, 255, 255, 0.2);
}

/* Remove old styles */
.map-toolbar {
  --background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  --color: white;
}

.map-title {
  --color: white;
}

.close-button {
  --color: #9ca3af;
  --color-hover: white;
}

/* Custom marker styles */
:deep(.custom-marker-container) {
  background: none !important;
  border: none !important;
}

:deep(.custom-marker) {
  position: relative;
  width: 60px;
  height: 80px;
}

:deep(.marker-pin) {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border: 3px solid white;
  border-radius: 50% 50% 50% 0;
  transform-origin: 0 70%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

:deep(.marker-pin.active-pin) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  animation: bounce 2s infinite;
}

:deep(.marker-icon) {
  font-size: 16px;
  line-height: 1;
}

:deep(.marker-temp) {
  font-size: 8px;
  font-weight: bold;
  color: white;
  margin-top: 2px;
}

:deep(.marker-pulse) {
  position: absolute;
  top: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 48px;
  border: 2px solid #3b82f6;
  border-radius: 50%;
  opacity: 0;
}

:deep(.marker-pulse.active-pulse) {
  animation: pulse 2s infinite;
  border-color: #10b981;
}

/* Custom popup styles */
:deep(.custom-popup .leaflet-popup-content-wrapper) {
  background: white;
  color: #374151;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
}

:deep(.custom-popup .leaflet-popup-content) {
  margin: 0;
  padding: 16px;
  font-family: inherit;
}

:deep(.station-popup) {
  min-width: 200px;
}

:deep(.popup-header) {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

:deep(.popup-icon) {
  font-size: 24px;
}

:deep(.popup-title) {
  font-weight: 600;
  font-size: 16px;
  color: #1f2937;
}

:deep(.popup-data) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
}

:deep(.data-item) {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:deep(.data-label) {
  font-size: 12px;
  color: #6b7280;
}

:deep(.data-value) {
  font-weight: 600;
  color: #3b82f6;
}

:deep(.popup-coords) {
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  margin-top: 8px;
}

/* Animations */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: translateX(-50%) scale(0.8);
  }
  50% {
    opacity: 0.3;
    transform: translateX(-50%) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) scale(1.5);
  }
}

/* User Location Marker Styles */
:deep(.user-location-container) {
  background: none !important;
  border: none !important;
}

:deep(.user-location-marker) {
  position: relative;
  width: 40px;
  height: 40px;
}

:deep(.user-location-pin) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
  z-index: 2;
  animation: user-location-bounce 2s infinite;
}

:deep(.user-location-icon) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  line-height: 1;
}

:deep(.user-location-pulse) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  border: 2px solid #ef4444;
  border-radius: 50%;
  animation: user-location-pulse 2s infinite;
}

:deep(.user-location-popup) {
  min-width: 180px;
}

@keyframes user-location-bounce {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes user-location-pulse {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1.5);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(2);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}

/* Slide Fade Animation for Station Panel */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  :deep(.marker-pin) {
    width: 40px;
    height: 40px;
  }
  
  :deep(.marker-pulse) {
    width: 40px;
    height: 40px;
  }
  
  :deep(.marker-icon) {
    font-size: 14px;
  }
  
  :deep(.marker-temp) {
    font-size: 7px;
  }
}
</style>
