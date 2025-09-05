<template>
  <div :class="[
    'wind-table-container',
    isTransforming ? 'table-transforming' : 'table-ready'
  ]">
    <!-- Header Section -->
    <div class="table-header">
      <div class="header-content">
        <div class="title-section">
          <h3 class="table-title">Wind Speed Timeline</h3>
          <p class="table-subtitle">Hourly wind data from 12mn to 11pm</p>
        </div>
        <button 
          @click="closeTable" 
          class="close-button"
          aria-label="Close wind speed table"
        >
          <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span class="close-text">Back to Card</span>
        </button>
      </div>
    </div>

    <!-- Carousel Container -->
    <div class="carousel-wrapper">
      <div class="loading-overlay" v-if="isLoading">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading wind data...</p>
      </div>
      
      <div v-else class="wind-carousel">
        <div class="carousel-scroll">
          <div 
            v-for="(entry, index) in windData" 
            :key="index"
            :class="[
              'wind-card',
              { 'current-hour': entry.isCurrent },
              { 'no-data': entry.windSpeed === null }
            ]"
          >
            <!-- Time Header -->
            <div class="card-time">
              <span class="time-main">{{ entry.time12h }}</span>
              <span v-if="entry.period" class="time-period">{{ entry.period }}</span>
            </div>
            
            <!-- Wind Speed Display -->
            <div class="card-wind">
              <span v-if="entry.windSpeed !== null" class="wind-value">
                {{ entry.windSpeed }} m/s
              </span>
              <span v-else class="no-data-text">--</span>
            </div>
            
            <!-- Wind Direction -->
            <div class="card-direction" v-if="entry.windDirection">
              <span class="direction-text">{{ entry.windDirection }}</span>
            </div>
            
            <!-- Wind Speed Bar -->
            <div class="wind-bar-container">
              <div 
                class="wind-bar"
                :style="{ 
                  height: entry.windSpeed !== null ? getWindSpeedBarHeight(entry.windSpeed) : '0%',
                  backgroundColor: getWindSpeedColor(entry.windSpeed)
                }"
              ></div>
            </div>
            
            <!-- Status Indicator -->
            <div class="card-status">
              <span 
                :class="[
                  'status-dot',
                  getWindSpeedStatus(entry.windSpeed).class
                ]"
              ></span>
              <span class="status-text">
                {{ getWindSpeedStatus(entry.windSpeed).text }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Carousel Navigation Hint -->
        <div class="carousel-hint">
          <svg class="scroll-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l4-4m0 0l4 4m-4-4v12"></path>
          </svg>
          <span>Scroll to see more hours</span>
          <svg class="scroll-icon rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l4-4m0 0l4 4m-4-4v12"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Footer with additional info -->
    <div class="table-footer">
      <div class="footer-stats">
        <div class="footer-stat">
          <span class="footer-label">Min Today:</span>
          <span class="footer-value">{{ minWindSpeed }} m/s</span>
        </div>
        <div class="footer-stat">
          <span class="footer-label">Max Today:</span>
          <span class="footer-value">{{ maxWindSpeed }} m/s</span>
        </div>
        <div class="footer-stat">
          <span class="footer-label">Last Updated:</span>
          <span class="footer-value">{{ lastUpdated }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { db } from '../firebase'
import { ref as dbRef, query, orderByKey, get, startAt, endAt, limitToLast } from 'firebase/database'
import { addHours, getUnixTime, startOfDay, format, fromUnixTime } from 'date-fns'

const props = defineProps<{ 
  stationId: string
  currentWindSpeed?: number 
  isTransforming?: boolean
}>()

const emit = defineEmits<{
  'animation-complete': []
  'close-table': []
}>()

interface WindEntry {
  hour: number
  time12h: string
  period: string
  windSpeed: number | null
  windDirection: string | null
  isCurrent: boolean
}

const isLoading = ref(true)
const lastUpdated = ref('')
const windData = ref<WindEntry[]>([])

// Simple timezone-aware date handling (Philippines is UTC+8)
function getLocalDate(timestamp: number): Date {
  return new Date(timestamp * 1000)
}

function getTodayStartTimestamp(): number {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.floor(todayStart.getTime() / 1000)
}

// Generate all hours from 12mn to 11pm
function generateHourlySlots(): WindEntry[] {
  const slots: WindEntry[] = []
  const now = new Date()
  const currentHour = now.getHours()
  
  for (let hour = 0; hour < 24; hour++) {
    let hour12 = hour % 12
    if (hour12 === 0) hour12 = 12
    const period = hour < 12 ? 'AM' : 'PM'
    
    // Special formatting for midnight and noon
    let timeDisplay = `${hour12}:00`
    if (hour === 0) timeDisplay = '12mn'
    else if (hour === 12) timeDisplay = '12nn'
    
    slots.push({
      hour,
      time12h: timeDisplay,
      period: hour === 0 || hour === 12 ? '' : period,
      windSpeed: null,
      windDirection: null,
      isCurrent: hour === currentHour
    })
  }
  
  return slots
}

// Computed properties
const minWindSpeed = computed(() => {
  const validSpeeds = windData.value
    .map(entry => entry.windSpeed)
    .filter(speed => speed !== null) as number[]
  
  return validSpeeds.length > 0 ? Math.min(...validSpeeds) : 0
})

const maxWindSpeed = computed(() => {
  const validSpeeds = windData.value
    .map(entry => entry.windSpeed)
    .filter(speed => speed !== null) as number[]
  
  return validSpeeds.length > 0 ? Math.max(...validSpeeds) : 0
})

// Helper functions for styling
function getWindSpeedBarHeight(speed: number | null): string {
  if (speed === null) return '0%'
  
  // Scale wind speed bar based on typical range (0 to 20 m/s)
  const maxSpeed = 20
  const normalizedSpeed = Math.max(0, Math.min(100, (speed / maxSpeed) * 100))
  
  return `${normalizedSpeed}%`
}

function getWindSpeedColor(speed: number | null): string {
  if (speed === null) return '#64748b'
  
  if (speed <= 2) return '#10b981' // Green - Calm
  if (speed <= 5) return '#3b82f6' // Blue - Light breeze
  if (speed <= 10) return '#f59e0b' // Yellow - Moderate breeze
  if (speed <= 15) return '#ef4444' // Red - Strong breeze
  return '#dc2626' // Dark red - High wind
}

function getWindSpeedStatus(speed: number | null): { text: string; class: string } {
  if (speed === null) return { text: 'No Data', class: 'status-gray' }
  
  if (speed <= 2) return { text: 'Calm', class: 'status-green' }
  if (speed <= 5) return { text: 'Light Breeze', class: 'status-blue' }
  if (speed <= 10) return { text: 'Moderate', class: 'status-yellow' }
  if (speed <= 15) return { text: 'Strong', class: 'status-orange' }
  return { text: 'High Wind', class: 'status-red' }
}

// Close table function
function closeTable() {
  emit('close-table')
}

// Convert wind angle to direction
function windAngleToDirection(angle: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(angle / 22.5) % 16
  return directions[index]
}

// Fetch wind data for today
async function fetchWindData(stationId: string) {
  isLoading.value = true
  
  try {
    console.log('Fetching wind data for station:', stationId)
    
    // Initialize data with empty slots
    windData.value = generateHourlySlots()

    const windSpeedRef = dbRef(db, `${stationId}/data/sensors/WSP`)
    const windDirectionRef = dbRef(db, `${stationId}/data/sensors/WD`)
    
    // Get today's data - accounting for UTC storage
    const now = new Date()
    const todayStartLocal = getTodayStartTimestamp()
    const todayStartUTC = todayStartLocal + (8 * 60 * 60) // Add 8 hours to convert to UTC
    
    console.log('Date range (accounting for UTC storage):')
    console.log('- Today start (local):', new Date(todayStartLocal * 1000).toLocaleString())
    console.log('- Today start (UTC for query):', new Date(todayStartUTC * 1000).toLocaleString())
    console.log('- Querying WSP and WD sensors')
    
    const todaySpeedQuery = query(windSpeedRef, orderByKey(), startAt(todayStartUTC.toString()))
    const todayDirectionQuery = query(windDirectionRef, orderByKey(), startAt(todayStartUTC.toString()))
    
    const [speedSnapshot, directionSnapshot] = await Promise.all([
      get(todaySpeedQuery),
      get(todayDirectionQuery)
    ])
    
    const hourSpeedMap: Record<number, number[]> = {}
    const hourDirectionMap: Record<number, string[]> = {}
    let totalEntries = 0
    let validEntries = 0
    
    // Process wind speed data
    if (speedSnapshot.exists()) {
      speedSnapshot.forEach(child => {
        totalEntries++
        const val = child.val()
        const timestamp = parseInt(child.key || '0')
        
        let windSpeed = 0
        if (typeof val === 'object' && val !== null && val.val !== undefined) {
          windSpeed = parseFloat(val.val) || 0
        } else if (typeof val === 'number') {
          windSpeed = val
        } else if (typeof val === 'string') {
          windSpeed = parseFloat(val) || 0
        }

        if (windSpeed >= 0) {
          validEntries++
          
          const date = getLocalDate(timestamp)
          const adjustedDate = new Date(date.getTime() - 8 * 60 * 60 * 1000)
          const hour = adjustedDate.getHours()
          
          const entryDate = new Date(adjustedDate.getFullYear(), adjustedDate.getMonth(), adjustedDate.getDate())
          const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          
          if (entryDate.getTime() === todayDate.getTime()) {
            if (!hourSpeedMap[hour]) hourSpeedMap[hour] = []
            hourSpeedMap[hour].push(windSpeed)
          }
        }
      })
    }
    
    // Process wind direction data
    if (directionSnapshot.exists()) {
      directionSnapshot.forEach(child => {
        const val = child.val()
        const timestamp = parseInt(child.key || '0')
        
        let windDirection = ''
        if (typeof val === 'object' && val !== null && val.val !== undefined) {
          windDirection = String(val.val) || ''
        } else if (typeof val === 'string') {
          windDirection = val
        } else {
          windDirection = String(val) || ''
        }

        if (windDirection) {
          const date = getLocalDate(timestamp)
          const adjustedDate = new Date(date.getTime() - 8 * 60 * 60 * 1000)
          const hour = adjustedDate.getHours()
          
          const entryDate = new Date(adjustedDate.getFullYear(), adjustedDate.getMonth(), adjustedDate.getDate())
          const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          
          if (entryDate.getTime() === todayDate.getTime()) {
            if (!hourDirectionMap[hour]) hourDirectionMap[hour] = []
            hourDirectionMap[hour].push(windDirection)
          }
        }
      })
    }
    
    console.log(`Processed ${totalEntries} total entries, ${validEntries} valid entries`)
    console.log('Speed hour distribution:', Object.keys(hourSpeedMap).map(h => `${h}:${hourSpeedMap[parseInt(h)].length}`).join(', '))
    console.log('Direction hour distribution:', Object.keys(hourDirectionMap).map(h => `${h}:${hourDirectionMap[parseInt(h)].length}`).join(', '))
    
    // Calculate average values for each hour
    windData.value.forEach(entry => {
      if (hourSpeedMap[entry.hour] && hourSpeedMap[entry.hour].length > 0) {
        const avgSpeed = hourSpeedMap[entry.hour].reduce((a, b) => a + b, 0) / hourSpeedMap[entry.hour].length
        entry.windSpeed = Math.round(avgSpeed * 10) / 10
      }
      
      if (hourDirectionMap[entry.hour] && hourDirectionMap[entry.hour].length > 0) {
        // Use the most recent direction for that hour (last in array)
        entry.windDirection = hourDirectionMap[entry.hour][hourDirectionMap[entry.hour].length - 1]
      }
    })

    lastUpdated.value = format(now, 'hh:mm:ss a')

  } catch (error: any) {
    console.error('Error fetching wind data:', error)
  } finally {
    isLoading.value = false
  }
}

watch(() => props.stationId, (newId) => {
  if (newId) {
    fetchWindData(newId)
  }
}, { immediate: true })

onMounted(() => {
  if (props.stationId) {
    fetchWindData(props.stationId)
  }
  
  // Emit animation complete after mount animation
  setTimeout(() => {
    emit('animation-complete')
  }, 1000)
})

defineExpose({ fetchWindData })
</script>

<style scoped>
.wind-table-container {
  width: 100%;
  background-color: #00000046;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.table-header {
  background-color: #0000002d;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.title-section {
  flex: 1;
  min-width: 200px;
}

.table-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.table-subtitle {
  font-size: 0.875rem;
  color: #cbd5e1;
  margin: 0;
}

.close-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.close-button:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.5);
  color: #60a5fa;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.close-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.3s ease;
}

.close-button:hover .close-icon {
  transform: rotate(90deg);
}

.close-text {
  display: none;
}

@media (min-width: 768px) {
  .close-text {
    display: inline;
  }
}

.carousel-wrapper {
  position: relative;
  overflow: hidden;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border-width: 3px;
  border-style: solid;
  border-color: #475569;
  border-top-color: #3b82f6;
  border-radius: 9999px;
  animation: spin 1s linear infinite;
  margin-bottom: 0.75rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #ffffff;
  font-size: 0.875rem;
}

.wind-carousel {
  padding: 1rem 0;
}

.carousel-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 1rem 1rem 1rem;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
}

.wind-card {
  flex: 0 0 auto;
  width: 120px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.wind-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(148, 163, 184, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.wind-card.current-hour {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.wind-card.no-data {
  opacity: 0.6;
  background: rgba(100, 116, 139, 0.1);
}

.card-time {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.time-main {
  font-weight: 700;
  color: #ffffff;
  font-size: 1rem;
  line-height: 1;
}

.time-period {
  font-size: 0.625rem;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-wind {
  text-align: center;
  margin: 0.25rem 0;
}

.wind-value {
  font-weight: 800;
  font-size: 1.25rem;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.card-direction {
  text-align: center;
  margin: 0.25rem 0;
}

.direction-text {
  font-weight: 600;
  font-size: 0.875rem;
  color: #60a5fa;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.no-data-text {
  color: #64748b;
  font-weight: 600;
  font-size: 1.25rem;
}

.wind-bar-container {
  width: 60px;
  height: 80px;
  background-color: rgba(148, 163, 184, 0.2);
  border-radius: 30px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: flex-end;
  border: 2px solid rgba(148, 163, 184, 0.1);
}

.wind-bar {
  width: 100%;
  border-radius: 30px;
  transition: height 0.8s ease, background-color 0.3s ease;
  min-height: 8px;
  background: linear-gradient(to top, currentColor, rgba(255, 255, 255, 0.2));
}

.card-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  text-align: center;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.status-text {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  line-height: 1.2;
}

.carousel-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.scroll-icon {
  width: 16px;
  height: 16px;
  opacity: 0.6;
  animation: bounce 2s infinite;
}

.rotate-180 {
  transform: rotate(180deg);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(0);
  }
  40% {
    transform: translateX(-4px);
  }
  60% {
    transform: translateX(4px);
  }
}

.table-footer {
  background-color: #0f172a;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.footer-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-label {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.footer-value {
  font-size: 0.875rem;
  color: #ffffff;
  font-weight: 600;
}

/* Status colors */
.status-blue { 
  background-color: #3b82f6;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
}
.status-green { 
  background-color: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}
.status-yellow { 
  background-color: #f59e0b;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
}
.status-orange { 
  background-color: #f97316;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.4);
}
.status-red { 
  background-color: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
}
.status-gray { 
  background-color: #64748b;
  box-shadow: 0 0 10px rgba(100, 116, 139, 0.4);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .carousel-scroll {
    padding: 0 0.75rem 1rem 0.75rem;
    gap: 0.75rem;
  }
  
  .wind-card {
    width: 100px;
    padding: 0.75rem;
  }
  
  .wind-value {
    font-size: 1rem;
  }
  
  .time-main {
    font-size: 0.875rem;
  }
  
  .wind-bar-container {
    width: 50px;
    height: 60px;
  }
  
  .status-text {
    font-size: 0.625rem;
  }
  
  .footer-stats {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .footer-stat {
    justify-content: space-between;
  }
  
  .carousel-hint {
    padding: 0.5rem;
    font-size: 0.6875rem;
  }
  
  .scroll-icon {
    width: 14px;
    height: 14px;
  }
}

/* Custom scrollbar for carousel */
.carousel-scroll::-webkit-scrollbar {
  height: 6px;
}

.carousel-scroll::-webkit-scrollbar-track {
  background: rgba(148, 163, 184, 0.1);
  border-radius: 3px;
  margin: 0 1rem;
}

.carousel-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.carousel-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

/* Table Transformation Animation Styles */
.wind-table-container {
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.table-transforming {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
  filter: blur(4px);
}

.table-ready {
  opacity: 1;
  transform: scale(1) translateY(0);
  filter: blur(0px);
  animation: tableEntrance 1s ease-out;
}

.table-exiting {
  animation: tableExit 0.4s ease-in both;
}

@keyframes tableEntrance {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(30px) rotateX(10deg);
    filter: blur(8px);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.02) translateY(-5px) rotateX(2deg);
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0) rotateX(0deg);
    filter: blur(0px);
  }
}

@keyframes tableExit {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0px);
  }
  100% {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
    filter: blur(4px);
  }
}

/* Enhanced carousel entrance animation */
.wind-carousel {
  animation: carouselSlideIn 0.8s ease-out 0.2s both;
}

@keyframes carouselSlideIn {
  0% {
    opacity: 0;
    transform: translateX(-100px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Staggered card animations */
.wind-card {
  animation: cardSlideUp 0.6s ease-out both;
}

.wind-card:nth-child(1) { animation-delay: 0.1s; }
.wind-card:nth-child(2) { animation-delay: 0.15s; }
.wind-card:nth-child(3) { animation-delay: 0.2s; }
.wind-card:nth-child(4) { animation-delay: 0.25s; }
.wind-card:nth-child(5) { animation-delay: 0.3s; }
.wind-card:nth-child(6) { animation-delay: 0.35s; }
.wind-card:nth-child(7) { animation-delay: 0.4s; }
.wind-card:nth-child(8) { animation-delay: 0.45s; }
.wind-card:nth-child(9) { animation-delay: 0.5s; }
.wind-card:nth-child(10) { animation-delay: 0.55s; }
.wind-card:nth-child(11) { animation-delay: 0.6s; }
.wind-card:nth-child(12) { animation-delay: 0.65s; }

@keyframes cardSlideUp {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Enhanced wind bar animation */
.wind-bar {
  animation: barFillUp 1.2s ease-out both;
}

@keyframes barFillUp {
  0% {
    height: 0%;
    opacity: 0.5;
  }
  60% {
    opacity: 0.8;
  }
  100% {
    opacity: 1;
  }
}

/* Reduce animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .wind-table-container,
  .wind-card,
  .wind-bar,
  .wind-carousel {
    animation: none !important;
    transition: none !important;
  }
  
  .table-transforming {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
</style>
