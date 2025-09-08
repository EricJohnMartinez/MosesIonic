<template>
  <div :class="[
    'w-full bg-black/25 rounded-xl overflow-hidden border border-slate-400/20 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
    isTransforming ? 'opacity-0 scale-90 translate-y-5 blur-sm' : 'opacity-100 scale-100 translate-y-0 blur-0 animate-[tableEntrance_1s_ease-out]'
  ]">
    <!-- Header Section with enhanced animation -->
    <div class="bg-black/15 p-6 border-b border-slate-400/10">
      <div class="flex justify-between items-start flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <h3 class="text-xl font-semibold text-white mb-1">Temperature Timeline</h3>
          <p class="text-sm text-slate-300 m-0">Hourly data from 12mn to 11pm</p>
        </div>
        <button 
          @click="closeTable" 
          class="flex items-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-500 text-sm font-semibold cursor-pointer transition-all duration-300 backdrop-blur-sm hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(59,130,246,0.2)]"
          aria-label="Close temperature table"
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
        <p class="text-white text-sm">Loading temperature data...</p>
      </div>
      
      <div v-else class="py-4 animate-[carouselSlideIn_0.8s_ease-out_0.2s_both]">
        <div class="flex gap-4 overflow-x-auto overflow-y-hidden px-4 pb-4 scroll-smooth scrollbar-thin scrollbar-track-slate-400/10 scrollbar-thumb-slate-400/30 hover:scrollbar-thumb-slate-400/50">
          <div 
            v-for="(entry, index) in temperatureData" 
            :key="index"
            :class="[
              'flex-none w-[120px] bg-white/5 border border-slate-400/20 rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-300 backdrop-blur-sm hover:bg-white/10 hover:border-slate-400/40 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] animate-[cardSlideUp_0.6s_ease-out_both]',
              { 'bg-blue-500/15 border-blue-500/40 shadow-[0_4px_20px_rgba(59,130,246,0.3)]': entry.isCurrent },
              { 'opacity-60 bg-slate-600/10': entry.temperature === null }
            ]"
            :style="{ animationDelay: `${0.1 + index * 0.05}s` }"
          >
            <!-- Time Header -->
            <div class="text-center flex flex-col items-center gap-1">
              <span class="font-bold text-white text-base leading-none">{{ entry.time12h }}</span>
              <span v-if="entry.period" class="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{{ entry.period }}</span>
            </div>
            
            <!-- Temperature Display -->
            <div class="text-center my-1">
              <span v-if="entry.temperature !== null" class="font-extrabold text-2xl text-white text-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                {{ entry.temperature }}°
              </span>
              <span v-else class="text-slate-600 font-semibold text-xl">--</span>
            </div>
            
            <!-- Temperature Bar -->
            <div class="w-[60px] h-20 bg-slate-400/20 rounded-[30px] overflow-hidden relative flex items-end border-2 border-slate-400/10">
              <div 
                class="w-full rounded-[30px] transition-all duration-[800ms] ease-out min-h-[8px] bg-gradient-to-t from-current to-white/20 animate-[barFillUp_1.2s_ease-out_both]"
                :style="{ 
                  height: entry.temperature !== null ? getTemperatureBarHeight(entry.temperature) : '0%',
                  backgroundColor: getTemperatureColor(entry.temperature)
                }"
              ></div>
            </div>
            
            <!-- Status Indicator -->
            <div class="flex flex-col items-center gap-1.5 text-center">
              <span 
                :class="[
                  'w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_2px_4px_rgba(0,0,0,0.2)]',
                  getTemperatureStatus(entry.temperature).class
                ]"
              ></span>
              <span class="text-[11px] font-semibold text-slate-200 uppercase tracking-wide leading-tight">
                {{ getTemperatureStatus(entry.temperature).text }}
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
      <div class="flex justify-between items-center flex-wrap gap-4 md:gap-0 md:flex-row flex-col">
        <div class="flex items-center gap-2 md:justify-start justify-between w-full md:w-auto">
          <span class="text-xs text-slate-400 font-medium">Min Today:</span>
          <span class="text-sm text-white font-semibold">{{ minTemperature }}°C</span>
        </div>
        <div class="flex items-center gap-2 md:justify-start justify-between w-full md:w-auto">
          <span class="text-xs text-slate-400 font-medium">Max Today:</span>
          <span class="text-sm text-white font-semibold">{{ maxTemperature }}°C</span>
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
  isTransforming?: boolean
}>()

const emit = defineEmits<{
  'animation-complete': []
  'close-table': []
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
  if (temp === null) return { text: 'No Data', class: 'bg-slate-600 shadow-[0_0_10px_rgba(100,116,139,0.4)]' }
  
  if (temp <= 20) return { text: 'Cool', class: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]' }
  if (temp <= 25) return { text: 'Comfortable', class: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' }
  if (temp <= 30) return { text: 'Warm', class: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' }
  if (temp <= 35) return { text: 'Hot', class: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]' }
  return { text: 'Very Hot', class: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' }
}

// Close table function
function closeTable() {
  emit('close-table')
}

// Fetch temperature data for today
async function fetchTemperatureData(stationId: string) {
  isLoading.value = true
  
  try {
   
    
    // Initialize data with empty slots
    temperatureData.value = generateHourlySlots()

    const tempRef = dbRef(db, `${stationId}/data/sensors/TEM`)
    
    // Get today's data - but account for UTC storage
    // If data is stored in UTC, we need to query from yesterday 16:00 UTC to today 16:00 UTC
    // to get all of today's Philippines time (UTC+8) data
    const now = new Date()
    const todayStartLocal = getTodayStartTimestamp()
    const todayStartUTC = todayStartLocal + (8 * 60 * 60) // Add 8 hours to convert to UTC
    
  
    
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
            
            
          } else {
          
          }
        }
      })
      
     
      
      // Calculate average temperature for each hour
      temperatureData.value.forEach(entry => {
        if (hourMap[entry.hour] && hourMap[entry.hour].length > 0) {
          const avg = hourMap[entry.hour].reduce((a, b) => a + b, 0) / hourMap[entry.hour].length
          entry.temperature = Math.round(avg * 10) / 10
          
        }
      })
      
    } else {
      
    }

    lastUpdated.value = format(now, 'hh:mm:ss a')

  } catch (error: any) {
    
   
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
  
  // Emit animation complete after mount animation
  setTimeout(() => {
    emit('animation-complete')
  }, 1000)
})

defineExpose({ fetchTemperatureData })
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
