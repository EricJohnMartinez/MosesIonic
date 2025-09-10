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
    
    <IonContent class="map-content">
      <!-- Map Container -->
      <div class="w-full h-full relative map-wrapper">
        <div ref="mapContainer" id="interactive-weather-map" class="w-full h-full"></div>
        
        <!-- Map Controls Panel - Fixed positioning to prevent disappearing -->
        <div class="map-controls-left">
          <!-- Layer Toggle -->
          <div class="control-panel">
            <div class="control-header">Map Style</div>
            <div class="control-buttons">
              <button 
                v-for="layer in mapLayers" 
                :key="layer.name"
                @click="changeMapLayer(layer)"
                :class="[
                  'layer-button',
                  currentLayer.name === layer.name ? 'active' : ''
                ]">
                {{ layer.name }}
              </button>
            </div>
          </div>

          <!-- Station Info Panel -->
          <div v-if="selectedMapStation" class="station-info-panel">
            <div class="station-header">
              <div class="station-name">
                <span class="station-icon">📍</span>
                <span class="station-title">{{ selectedMapStation.name }}</span>
              </div>
              <button @click="selectedMapStation = null" class="close-station-btn">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div v-if="selectedMapStation.data" class="station-data">
              <div class="data-card temperature">
                <div class="data-label">Temperature</div>
                <div class="data-value">{{ selectedMapStation.data.temperature }}°C</div>
              </div>
              <div class="data-card humidity">
                <div class="data-label">Humidity</div>
                <div class="data-value">{{ selectedMapStation.data.humidity }}%</div>
              </div>
              <div class="data-card wind">
                <div class="data-label">Wind Speed</div>
                <div class="data-value">{{ selectedMapStation.data.windSpeed }} m/s</div>
              </div>
              <div class="data-card rainfall">
                <div class="data-label">Rainfall</div>
                <div class="data-value">{{ selectedMapStation.data.rainfall }} mm</div>
              </div>
            </div>
            
            <button 
              @click="selectStationAndClose(selectedMapStation.id)"
              class="select-station-btn">
              Switch to This Station
            </button>
          </div>
        </div>

        <!-- Map Legend - Fixed positioning -->
        <div class="map-legend">
          <div class="legend-header">Legend</div>
          <div class="legend-items">
            <div class="legend-item">
              <div class="legend-dot active"></div>
              <span class="legend-text">Active Station</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot available"></div>
              <span class="legend-text">Available Station</span>
            </div>
          </div>
        </div>
        
        <!-- Loading Overlay -->
        <div v-if="isMapLoading" class="loading-overlay">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <span class="loading-text">Loading map...</span>
          </div>
        </div>
      </div>
    </IonContent>
  </IonModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButton, IonButtons, IonContent } from '@ionic/vue';

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
  
  if (rainfall > 50) return '🌧️';
  if (rainfall > 0) return '🌦️';
  if (lux <= 10000) return '☁️';
  if (lux <= 30000) return '⛅';
  return '☀️';
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

watch(() => props.stations, () => {
  if (map) {
    updateMarkers();
  }
}, { deep: true });

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

.map-content {
  --background: #f3f4f6;
}

.map-wrapper {
  position: relative;
  overflow: hidden;
}

/* Map Controls - Left Side */
.map-controls-left {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 250px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.control-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px;
  transition: all 0.3s ease;
}

.control-panel:hover {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.control-header {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layer-button {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8fafc;
  color: #475569;
}

.layer-button:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.layer-button.active {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Station Info Panel */
.station-info-panel {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 20px;
  max-width: 280px;
  animation: slideInLeft 0.3s ease;
  max-height: 400px;
  overflow-y: auto;
}

.station-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.station-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.station-icon {
  font-size: 20px;
}

.station-title {
  font-weight: 700;
  color: #1f2937;
  font-size: 16px;
}

.close-station-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-station-btn:hover {
  color: #6b7280;
  background: #f3f4f6;
}

.station-data {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.data-card {
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  transition: all 0.2s ease;
}

.data-card:hover {
  transform: translateY(-2px);
}

.data-card.temperature {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.data-card.humidity {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.data-card.wind {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.data-card.rainfall {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
}

.data-label {
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
  font-weight: 500;
}

.data-value {
  font-weight: 700;
  font-size: 14px;
}

.data-card.temperature .data-value {
  color: #1d4ed8;
}

.data-card.humidity .data-value {
  color: #059669;
}

.data-card.wind .data-value {
  color: #6366f1;
}

.data-card.rainfall .data-value {
  color: #ea580c;
}

.select-station-btn {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.select-station-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

/* Map Legend - Right Side */
.map-legend {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px;
  min-width: 140px;
}

.legend-header {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.active {
  background: #10b981;
  animation: pulse 2s infinite;
}

.legend-dot.available {
  background: #3b82f6;
}

.legend-text {
  font-size: 12px;
  color: #374151;
  font-weight: 500;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(17, 24, 39, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.loading-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #374151;
  font-weight: 600;
  font-size: 14px;
}

/* Animations */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .map-controls-left {
    max-width: 200px;
    top: 12px;
    left: 12px;
  }
  
  .control-panel {
    padding: 12px;
  }
  
  .station-info-panel {
    max-width: 240px;
    padding: 16px;
  }
  
  .station-data {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .map-legend {
    bottom: 12px;
    right: 12px;
    padding: 12px;
    min-width: 120px;
  }
}

@media (max-width: 480px) {
  .map-controls-left {
    max-width: 180px;
    gap: 8px;
  }
  
  .control-header {
    font-size: 13px;
  }
  
  .layer-button {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .station-info-panel {
    max-width: 200px;
  }
  
  .station-title {
    font-size: 14px;
  }
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
