<template>
  <div :class="[
    'w-full bg-black/25 rounded-xl overflow-hidden border border-slate-400/20 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
    isTransforming ? 'opacity-0 scale-90 translate-y-5 blur-sm' : 'opacity-100 scale-100 translate-y-0 blur-0 animate-[tableEntrance_1s_ease-out]'
  ]">
    <!-- Header Section -->
    <div class="bg-black/15 p-6 border-b border-slate-400/10">
      <div class="flex justify-between items-start flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <h3 class="text-xl font-semibold text-white mb-1">Wind Speed Timeline</h3>
          <p class="text-sm text-slate-300 m-0">Hourly wind data from 12mn to 11pm</p>
        </div>
        <button 
          @click="closeTable" 
          class="flex items-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-500 text-sm font-semibold cursor-pointer transition-all duration-300 backdrop-blur-sm hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(59,130,246,0.2)]"
          aria-label="Close wind speed table"
        >
          <svg class="w-4 h-4 transition-transform duration-300 hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span class="hidden md:inline">Back to Card</span>
        </button>
      </div>
    </div>

    <!-- Carousel Container -->
    <div class="relative overflow-hidden">
      <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/30 z-10 backdrop-blur-sm" v-if="isLoading">
        <div class="w-8 h-8 border-3 border-slate-600 border-t-blue-500 rounded-full animate-spin mb-3"></div>
        <p class="text-white text-sm">Loading wind data...</p>
      </div>
      
      <div v-else class="py-4 animate-[carouselSlideIn_0.8s_ease-out_0.2s_both]">
        <div class="flex gap-4 overflow-x-auto overflow-y-hidden px-4 pb-4 scroll-smooth scrollbar-thin scrollbar-track-slate-400/10 scrollbar-thumb-slate-400/30 hover:scrollbar-thumb-slate-400/50">
          <div 
            v-for="(entry, index) in windData" 
            :key="index"
            :class="[
              'flex-none w-[120px] bg-white/5 border border-slate-400/20 rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-300 backdrop-blur-sm hover:bg-white/10 hover:border-slate-400/40 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] animate-[cardSlideUp_0.6s_ease-out_both]',
              { 'bg-blue-500/15 border-blue-500/40 shadow-[0_4px_20px_rgba(59,130,246,0.3)]': entry.isCurrent },
              { 'opacity-60 bg-slate-600/10': entry.windSpeed === null }
            ]"
            :style="{ animationDelay: `${0.1 + index * 0.05}s` }"
          >
            <!-- Time Header -->
            <div class="text-center flex flex-col items-center gap-1">
              <span class="font-bold text-white text-base leading-none">{{ entry.time12h }}</span>
              <span v-if="entry.period" class="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{{ entry.period }}</span>
            </div>
            
            <!-- Wind Speed Display -->
            <div class="text-center my-1">
              <span v-if="entry.windSpeed !== null" class="font-extrabold text-xl text-white text-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                {{ entry.windSpeed }} m/s
              </span>
              <span v-else class="text-slate-600 font-semibold text-xl">--</span>
            </div>
            
            <!-- Wind Direction -->
            <div class="text-center my-1" v-if="entry.windDirection">
              <span class="font-semibold text-sm text-blue-400 text-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">{{ entry.windDirection }}</span>
            </div>
            
            <!-- Wind Speed Bar -->
            <div class="w-[60px] h-20 bg-slate-400/20 rounded-[30px] overflow-hidden relative flex items-end border-2 border-slate-400/10">
              <div 
                class="w-full rounded-[30px] transition-all duration-[800ms] ease-out min-h-[8px] bg-gradient-to-t from-current to-white/20 animate-[barFillUp_1.2s_ease-out_both]"
                :style="{ 
                  height: entry.windSpeed !== null ? getWindSpeedBarHeight(entry.windSpeed) : '0%',
                  backgroundColor: getWindSpeedColor(entry.windSpeed)
                }"
              ></div>
            </div>
            
            <!-- Status Indicator -->
            <div class="flex flex-col items-center gap-1.5 text-center">
              <span 
                :class="[
                  'w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_2px_4px_rgba(0,0,0,0.2)]',
                  getWindSpeedStatus(entry.windSpeed).class
                ]"
              ></span>
              <span class="text-[11px] font-semibold text-slate-200 uppercase tracking-wide leading-tight">
                {{ getWindSpeedStatus(entry.windSpeed).text }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Carousel Navigation Hint -->
        <div class="flex items-center justify-center gap-2 px-3 py-2 text-slate-400 text-xs font-medium uppercase tracking-wide">
          <svg class="w-4 h-4 opacity-60 animate-[bounce_2s_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l4-4m0 0l4 4m-4-4v12"></path>
          </svg>
          <span>Scroll to see more hours</span>
          <svg class="w-4 h-4 opacity-60 animate-[bounce_2s_infinite] rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l4-4m0 0l4 4m-4-4v12"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Footer with additional info -->
    <div class="bg-slate-900 px-6 py-4 border-t border-slate-400/10">
      <div class="flex justify-between items-center flex-wrap gap-4 md:gap-1">
        <div class="flex items-center gap-2 md:justify-start justify-between w-full md:w-auto">
          <span class="text-xs text-slate-400 font-medium">Min Today:</span>
          <span class="text-sm text-white font-semibold">{{ minWindSpeed }} m/s</span>
        </div>
        <div class="flex items-center gap-2 md:justify-start justify-between w-full md:w-auto">
          <span class="text-xs text-slate-400 font-medium">Max Today:</span>
          <span class="text-sm text-white font-semibold">{{ maxWindSpeed }} m/s</span>
        </div>
        <div class="flex items-center gap-2 md:justify-start justify-between w-full md:w-auto">
          <span class="text-xs text-slate-400 font-medium">Last Updated:</span>
          <span class="text-sm text-white font-semibold">{{ lastUpdated }}</span>
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
  if (speed === null) return { text: 'No Data', class: 'bg-slate-600 shadow-[0_0_10px_rgba(100,116,139,0.4)]' }
  
  if (speed <= 2) return { text: 'Calm', class: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' }
  if (speed <= 5) return { text: 'Light Breeze', class: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]' }
  if (speed <= 10) return { text: 'Moderate', class: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' }
  if (speed <= 15) return { text: 'Strong', class: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]' }
  return { text: 'High Wind', class: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' }
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
    
    
    // Initialize data with empty slots
    windData.value = generateHourlySlots()

    const windSpeedRef = dbRef(db, `${stationId}/data/sensors/WSP`)
    const windDirectionRef = dbRef(db, `${stationId}/data/sensors/WD`)
    
    // Get today's data - accounting for UTC storage
    const now = new Date()
    const todayStartLocal = getTodayStartTimestamp()
    const todayStartUTC = todayStartLocal + (8 * 60 * 60) // Add 8 hours to convert to UTC
    
 
    
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
/* Custom animations for enhanced user experience */
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

/* Custom scrollbar styles */
.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}

.scrollbar-track-slate-400\/10::-webkit-scrollbar-track {
  background: rgba(148, 163, 184, 0.1);
  border-radius: 3px;
  margin: 0 1rem;
}

.scrollbar-thumb-slate-400\/30::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.scrollbar-thumb-slate-400\/30:hover::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.5);
}

/* Reduce animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
