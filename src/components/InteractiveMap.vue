<template>
  <IonModal ref="mapModal" :is-open="isOpen" @willDismiss="handleDismiss">
    <IonHeader class="ion-no-border">
      <IonToolbar class="map-toolbar">
        <IonTitle class="map-title">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">🗺️</span>
            <div>
              <div class="text-lg font-bold text-white">Weather Stations Map</div>
              <div class="text-sm text-gray-300">{{ stations.length }} stations available</div>
            </div>
          </div>
        </IonTitle>
        <IonButtons slot="end">
          <IonButton @click="closeModal" class="close-button">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
    
    <IonContent class="bg-gray-100">
      <!-- Map Container -->
      <div class="w-full h-full relative overflow-hidden">
        <div ref="mapContainer" id="interactive-weather-map" class="w-full h-full"></div>
        
        <!-- Map Controls Panel - Fixed positioning to prevent disappearing -->
        <div class="absolute top-4 left-4 z-[1000] flex flex-col gap-3 max-w-[250px] max-h-[calc(100vh-200px)] overflow-y-auto">
          <!-- Layer Toggle -->
          <div class="bg-white/95 backdrop-blur-[12px] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/20 p-4 transition-all duration-300 hover:bg-white/98 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
            <div class="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">Map Style</div>
            <div class="flex flex-col gap-2">
              <button 
                v-for="layer in mapLayers" 
                :key="layer.name"
                @click="changeMapLayer(layer)"
                :class="[
                  'px-4 py-2.5 rounded-lg text-xs font-medium border-none cursor-pointer transition-all duration-200',
                  currentLayer.name === layer.name
                    ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)]'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-200 hover:-translate-y-0.5'
                ]">
                {{ layer.name }}
              </button>
            </div>
          </div>

          <!-- Station Info Panel -->
          <div v-if="selectedMapStation" class="bg-white/98 backdrop-blur-[16px] rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.15)] border border-white/30 p-5 max-w-[280px] animate-[slideInLeft_0.3s_ease] max-h-[400px] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="text-xl">📍</span>
                <span class="font-bold text-gray-800 text-base">{{ selectedMapStation.name }}</span>
              </div>
              <button @click="selectedMapStation = null" class="bg-none border-none text-gray-400 cursor-pointer p-1 rounded-md transition-all duration-200 hover:text-gray-600 hover:bg-gray-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div v-if="selectedMapStation.data" class="grid grid-cols-2 gap-3 mb-4">
              <div class="p-3 rounded-xl text-center transition-all duration-200 hover:-translate-y-0.5 bg-gradient-to-br from-blue-50 to-blue-100">
                <div class="text-xs text-gray-600 mb-1 font-medium">Temperature</div>
                <div class="font-bold text-sm text-blue-700">{{ selectedMapStation.data.temperature }}°C</div>
              </div>
              <div class="p-3 rounded-xl text-center transition-all duration-200 hover:-translate-y-0.5 bg-gradient-to-br from-green-50 to-green-100">
                <div class="text-xs text-gray-600 mb-1 font-medium">Humidity</div>
                <div class="font-bold text-sm text-green-700">{{ selectedMapStation.data.humidity }}%</div>
              </div>
              <div class="p-3 rounded-xl text-center transition-all duration-200 hover:-translate-y-0.5 bg-gradient-to-br from-indigo-50 to-indigo-100">
                <div class="text-xs text-gray-600 mb-1 font-medium">Wind Speed</div>
                <div class="font-bold text-sm text-indigo-700">{{ selectedMapStation.data.windSpeed }} m/s</div>
              </div>
              <div class="p-3 rounded-xl text-center transition-all duration-200 hover:-translate-y-0.5 bg-gradient-to-br from-orange-50 to-orange-100">
                <div class="text-xs text-gray-600 mb-1 font-medium">Rainfall</div>
                <div class="font-bold text-sm text-orange-700">{{ selectedMapStation.data.rainfall }} mm</div>
              </div>
            </div>
            
            <button 
              @click="selectStationAndClose(selectedMapStation.id)"
              class="w-full py-3 px-4 bg-gradient-to-br from-blue-500 to-blue-700 text-white border-none rounded-2xl font-semibold text-sm cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:from-blue-600 hover:to-blue-800 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(59,130,246,0.4)]">
              Switch to This Station
            </button>
          </div>
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

// Map instances
let map: any = null;
let currentBaseLayer: any = null; // Track current base layer
const markerMap: { [key: string]: any } = {};
let weatherLayer: any = null;

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
    url: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.png',
    attribution: '© Stadia Maps © Stamen Design © OpenMapTiles'
  },
  {
    name: 'Dark',
    url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
    attribution: '© CartoDB'
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

function changeMapLayer(layer: MapLayer) {
  if (!map) return;
  
  currentLayer.value = layer;
  
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
    
    // Get and add user location
    getUserLocation().then(location => {
      if (location) {
        userLocation.value = location;
        addUserLocationMarker(location);
      }
    });
    
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
