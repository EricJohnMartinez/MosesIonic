<template>
  <div class="temperature-table-container">
    <!-- Header Section -->


    <!-- Carousel Container -->
    <div class="carousel-wrapper">
      <div class="loading-overlay" v-if="isLoading">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading temperature data...</p>
      </div>
      
      <div v-else class="temperature-carousel">
        <div class="carousel-scroll">
          <div 
            v-for="(entry, index) in temperatureData" 
            :key="index"
            :class="[
              'temp-card',
              { 'current-hour': entry.isCurrent },
              { 'no-data': entry.temperature === null }
            ]"
          >
            <!-- Time Header -->
            <div class="card-time">
              <span class="time-main">{{ entry.time12h }}</span>
              <span v-if="entry.period" class="time-period">{{ entry.period }}</span>
            </div>
            
            <!-- Temperature Display -->
            <div class="card-temp">
              <span v-if="entry.temperature !== null" class="temp-value">
                {{ entry.temperature }}°
              </span>
              <span v-else class="no-data-text">--</span>
            </div>
            
            <!-- Temperature Bar -->
            <div class="temp-bar-container">
              <div 
                class="temp-bar"
                :style="{ 
                  height: entry.temperature !== null ? getTemperatureBarHeight(entry.temperature) : '0%',
                  backgroundColor: getTemperatureColor(entry.temperature)
                }"
              ></div>
            </div>
            
            <!-- Status Indicator -->
            <div class="card-status">
              <span 
                :class="[
                  'status-dot',
                  getTemperatureStatus(entry.temperature).class
                ]"
              ></span>
              <span class="status-text">
                {{ getTemperatureStatus(entry.temperature).text }}
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
          <span class="footer-value">{{ minTemperature }}°C</span>
        </div>
        <div class="footer-stat">
          <span class="footer-label">Max Today:</span>
          <span class="footer-value">{{ maxTemperature }}°C</span>
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
  currentTemperature?: number 
}>()

interface TemperatureEntry {
  hour: number
  time12h: string
  period: string
  temperature: number | null
  isCurrent: boolean
}

const isLoading = ref(true)
const lastUpdated = ref('')
const temperatureData = ref<TemperatureEntry[]>([])

// Simple timezone-aware date handling (Philippines is UTC+8)
function getLocalDate(timestamp: number): Date {
  // Timestamps in Firebase are likely already in local time or UTC
  // Let's use them directly first and see what happens
  return new Date(timestamp * 1000)
}

function getTodayStartTimestamp(): number {
  // Get start of today in local time, then convert to Unix timestamp
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.floor(todayStart.getTime() / 1000)
}

// Generate all hours from 12mn to 11pm
function generateHourlySlots(): TemperatureEntry[] {
  const slots: TemperatureEntry[] = []
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
      temperature: null,
      isCurrent: hour === currentHour
    })
  }
  
  return slots
}

// Computed properties
const averageTemperature = computed(() => {
  const validTemps = temperatureData.value
    .map(entry => entry.temperature)
    .filter(temp => temp !== null) as number[]
  
  if (validTemps.length === 0) return 0
  
  const sum = validTemps.reduce((a, b) => a + b, 0)
  return Math.round((sum / validTemps.length) * 10) / 10
})

const minTemperature = computed(() => {
  const validTemps = temperatureData.value
    .map(entry => entry.temperature)
    .filter(temp => temp !== null) as number[]
  
  return validTemps.length > 0 ? Math.min(...validTemps) : 0
})

const maxTemperature = computed(() => {
  const validTemps = temperatureData.value
    .map(entry => entry.temperature)
    .filter(temp => temp !== null) as number[]
  
  return validTemps.length > 0 ? Math.max(...validTemps) : 0
})

// Helper functions for styling
function getTemperatureBarWidth(temp: number | null): string {
  if (temp === null) return '0%'
  
  // Scale temperature bar based on typical range (15°C to 40°C)
  const minTemp = 15
  const maxTemp = 40
  const normalizedTemp = Math.max(0, Math.min(100, ((temp - minTemp) / (maxTemp - minTemp)) * 100))
  
  return `${normalizedTemp}%`
}

function getTemperatureBarHeight(temp: number | null): string {
  if (temp === null) return '0%'
  
  // Scale temperature bar based on typical range (15°C to 40°C)
  const minTemp = 15
  const maxTemp = 40
  const normalizedTemp = Math.max(0, Math.min(100, ((temp - minTemp) / (maxTemp - minTemp)) * 100))
  
  return `${normalizedTemp}%`
}

function getTemperatureColor(temp: number | null): string {
  if (temp === null) return '#64748b'
  
  if (temp <= 20) return '#3b82f6' // Blue - Cool
  if (temp <= 25) return '#10b981' // Green - Comfortable
  if (temp <= 30) return '#f59e0b' // Yellow - Warm
  if (temp <= 35) return '#ef4444' // Red - Hot
  return '#dc2626' // Dark red - Very hot
}

function getTemperatureStatus(temp: number | null): { text: string; class: string } {
  if (temp === null) return { text: 'No Data', class: 'status-gray' }
  
  if (temp <= 20) return { text: 'Cool', class: 'status-blue' }
  if (temp <= 25) return { text: 'Comfortable', class: 'status-green' }
  if (temp <= 30) return { text: 'Warm', class: 'status-yellow' }
  if (temp <= 35) return { text: 'Hot', class: 'status-orange' }
  return { text: 'Very Hot', class: 'status-red' }
}

// Fetch temperature data for today
async function fetchTemperatureData(stationId: string) {
  isLoading.value = true
  
  try {
    console.log('Fetching temperature data for station:', stationId)
    
    // Initialize data with empty slots
    temperatureData.value = generateHourlySlots()

    const tempRef = dbRef(db, `${stationId}/data/sensors/TEM`)
    
    // Get today's data - but account for UTC storage
    // If data is stored in UTC, we need to query from yesterday 16:00 UTC to today 16:00 UTC
    // to get all of today's Philippines time (UTC+8) data
    const now = new Date()
    const todayStartLocal = getTodayStartTimestamp()
    const todayStartUTC = todayStartLocal + (8 * 60 * 60) // Add 8 hours to convert to UTC
    
    console.log('Date range (accounting for UTC storage):')
    console.log('- Today start (local):', new Date(todayStartLocal * 1000).toLocaleString())
    console.log('- Today start (UTC for query):', new Date(todayStartUTC * 1000).toLocaleString())
    console.log('- Query timestamp:', todayStartUTC)
    
    const todayQuery = query(tempRef, orderByKey(), startAt(todayStartUTC.toString()))
    const snapshot = await get(todayQuery)
    
    const hourMap: Record<number, number[]> = {}
    let totalEntries = 0
    let validEntries = 0
    
    if (snapshot.exists()) {
      snapshot.forEach(child => {
        totalEntries++
        const val = child.val()
        const timestamp = parseInt(child.key || '0')
        
        // Extract temperature using same logic as HomePage
        let temperature = 0
        if (typeof val === 'object' && val !== null && val.val !== undefined) {
          temperature = parseFloat(val.val) || 0
        } else if (typeof val === 'number') {
          temperature = val
        } else if (typeof val === 'string') {
          temperature = parseFloat(val) || 0
        }

        if (temperature > 0) {
          validEntries++
          
          // Convert timestamp to local date and adjust for UTC+8 timezone
          const date = getLocalDate(timestamp)
          // Subtract 8 hours to convert from UTC to Philippines time
          const adjustedDate = new Date(date.getTime() - 8 * 60 * 60 * 1000)
          const hour = adjustedDate.getHours()
          
          // Only include data from today (using adjusted date)
          const entryDate = new Date(adjustedDate.getFullYear(), adjustedDate.getMonth(), adjustedDate.getDate())
          const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          
          if (entryDate.getTime() === todayDate.getTime()) {
            if (!hourMap[hour]) hourMap[hour] = []
            hourMap[hour].push(temperature)
            
            console.log(`Entry: ${date.toLocaleString()} -> adjusted: ${adjustedDate.toLocaleString()} (hour ${hour}) -> ${temperature}°C`)
          } else {
            console.log(`Skipping entry from different day: ${adjustedDate.toLocaleString()}`)
          }
        }
      })
      
      console.log(`Processed ${totalEntries} total entries, ${validEntries} valid entries`)
      console.log('Hour distribution:', Object.keys(hourMap).map(h => `${h}:${hourMap[parseInt(h)].length}`).join(', '))
      
      // Calculate average temperature for each hour
      temperatureData.value.forEach(entry => {
        if (hourMap[entry.hour] && hourMap[entry.hour].length > 0) {
          const avg = hourMap[entry.hour].reduce((a, b) => a + b, 0) / hourMap[entry.hour].length
          entry.temperature = Math.round(avg * 10) / 10
          console.log(`Hour ${entry.hour} (${entry.time12h}): ${hourMap[entry.hour].length} readings, avg: ${entry.temperature}°C`)
        }
      })
      
    } else {
      console.log('No data found for today')
    }

    lastUpdated.value = format(now, 'hh:mm:ss a')

  } catch (error: any) {
    console.error('Error fetching temperature data:', error)
    console.log('Error details:', error.message || 'Unknown error')
  } finally {
    isLoading.value = false
  }
}

watch(() => props.stationId, (newId) => {
  if (newId) {
    fetchTemperatureData(newId)
  }
}, { immediate: true })

onMounted(() => {
  if (props.stationId) {
    fetchTemperatureData(props.stationId)
  }
})

defineExpose({ fetchTemperatureData })
</script>

<style scoped>
.temperature-table-container {
  width: 100%;
  background-color: #00000046;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.chart-header {
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

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.875rem;
  color: #cbd5e1;
  margin: 0;
}

.current-stats {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-card {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(148, 163, 184, 0.1);
  min-width: 100px;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffffff;
  margin-top: 0.25rem;
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

.temperature-carousel {
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

.temp-card {
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

.temp-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(148, 163, 184, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.temp-card.current-hour {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

.temp-card.no-data {
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

.card-temp {
  text-align: center;
  margin: 0.25rem 0;
}

.temp-value {
  font-weight: 800;
  font-size: 1.5rem;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.no-data-text {
  color: #64748b;
  font-weight: 600;
  font-size: 1.25rem;
}

.temp-bar-container {
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

.temp-bar {
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

/* Mobile responsiveness */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .current-stats {
    justify-content: space-between;
  }
  
  .stat-card {
    flex: 1;
    text-align: center;
  }
  
  .carousel-scroll {
    padding: 0 0.75rem 1rem 0.75rem;
    gap: 0.75rem;
  }
  
  .temp-card {
    width: 100px;
    padding: 0.75rem;
  }
  
  .temp-value {
    font-size: 1.25rem;
  }
  
  .time-main {
    font-size: 0.875rem;
  }
  
  .temp-bar-container {
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

</style>
