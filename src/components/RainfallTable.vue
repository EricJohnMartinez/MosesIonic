<template>
  <div :class="[
    'w-full bg-black/25 rounded-xl overflow-hidden border border-slate-400/20 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
    isTransforming ? 'opacity-0 scale-90 translate-y-5 blur-sm' : 'opacity-100 scale-100 translate-y-0 blur-0 animate-[tableEntrance_1s_ease-out]'
  ]">
    <!-- Header Section -->
    <div class="bg-black/15 p-6 border-b border-slate-400/10">
      <div class="flex justify-between items-start flex-wrap gap-4">
        <div class="flex-1 min-w-[200px]">
          <h3 class="text-xl font-semibold text-white mb-1">Rainfall Timeline</h3>
          <p class="text-sm text-slate-300 m-0">Hourly rainfall data from 12mn to 11pm</p>
        </div>
        <button 
          @click="closeTable" 
          class="flex items-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-500 text-sm font-semibold cursor-pointer transition-all duration-300 backdrop-blur-sm hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(59,130,246,0.2)]"
          aria-label="Close rainfall table"
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
        <p class="text-white text-sm">Loading rainfall data...</p>
      </div>
      
      <div v-else class="py-4 animate-[carouselSlideIn_0.8s_ease-out_0.2s_both]">
        <div class="flex gap-4 overflow-x-auto overflow-y-hidden px-4 pb-4 scroll-smooth scrollbar-thin scrollbar-track-slate-400/10 scrollbar-thumb-slate-400/30 hover:scrollbar-thumb-slate-400/50">
          <div 
            v-for="(entry, index) in rainfallData" 
            :key="index"
            :class="[
              'flex-none w-[120px] bg-white/5 border border-slate-400/20 rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-300 backdrop-blur-sm hover:bg-white/10 hover:border-slate-400/40 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] animate-[cardSlideUp_0.6s_ease-out_both]',
              { 'bg-blue-500/15 border-blue-500/40 shadow-[0_4px_20px_rgba(59,130,246,0.3)]': entry.isCurrent },
              { 'opacity-60 bg-slate-600/10': entry.rainfall === null }
            ]"
            :style="{ animationDelay: `${0.1 + index * 0.05}s` }"
          >
            <!-- Time Header -->
            <div class="text-center flex flex-col items-center gap-1">
              <span class="font-bold text-white text-base leading-none">{{ entry.time12h }}</span>
              <span v-if="entry.period" class="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{{ entry.period }}</span>
            </div>
            
            <!-- Rainfall Display -->
            <div class="text-center my-1">
              <span v-if="entry.rainfall !== null" class="font-extrabold text-xl text-white text-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                {{ entry.rainfall }} mm
              </span>
              <span v-else class="text-slate-600 font-semibold text-xl">--</span>
            </div>
            
            <!-- Rainfall Bar -->
            <div class="w-[60px] h-20 bg-slate-400/20 rounded-[30px] overflow-hidden relative flex items-end border-2 border-slate-400/10">
              <div 
                class="w-full rounded-[30px] transition-all duration-[800ms] ease-out min-h-[8px] bg-gradient-to-t from-current to-white/20 animate-[barFillUp_1.2s_ease-out_both]"
                :style="{ 
                  height: entry.rainfall !== null ? getRainfallBarHeight(entry.rainfall) : '0%',
                  backgroundColor: getRainfallColor(entry.rainfall)
                }"
              ></div>
            </div>
            
            <!-- Status Indicator -->
            <div class="flex flex-col items-center gap-1.5 text-center">
              <span 
                :class="[
                  'w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-[0_2px_4px_rgba(0,0,0,0.2)]',
                  getRainfallStatus(entry.rainfall).class
                ]"
              ></span>
              <span class="text-[11px] font-semibold text-slate-200 uppercase tracking-wide leading-tight">
                {{ getRainfallStatus(entry.rainfall).text }}
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
          <span class="text-xs text-slate-400 font-medium">Total Today:</span>
          <span class="text-sm text-white font-semibold">{{ totalRainfall }} mm</span>
        </div>
        <div class="flex items-center gap-2 md:justify-start justify-between w-full md:w-auto">
          <span class="text-xs text-slate-400 font-medium">Peak Hour:</span>
          <span class="text-sm text-white font-semibold">{{ maxRainfall }} mm</span>
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
  currentRainfall?: number 
  isTransforming?: boolean
}>()

const emit = defineEmits<{
  'animation-complete': []
  'close-table': []
}>()

interface RainfallEntry {
  hour: number
  time12h: string
  period: string
  rainfall: number | null
  isCurrent: boolean
}

const isLoading = ref(true)
const lastUpdated = ref('')
const rainfallData = ref<RainfallEntry[]>([])

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
function generateHourlySlots(): RainfallEntry[] {
  const slots: RainfallEntry[] = []
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
      rainfall: null,
      isCurrent: hour === currentHour
    })
  }
  
  return slots
}

// Computed properties
const totalRainfall = computed(() => {
  const validRainfall = rainfallData.value
    .map(entry => entry.rainfall)
    .filter(rainfall => rainfall !== null) as number[]
  
  return validRainfall.length > 0 ? Math.round(validRainfall.reduce((a, b) => a + b, 0) * 100) / 100 : 0
})

const maxRainfall = computed(() => {
  const validRainfall = rainfallData.value
    .map(entry => entry.rainfall)
    .filter(rainfall => rainfall !== null) as number[]
  
  return validRainfall.length > 0 ? Math.max(...validRainfall) : 0
})

// Helper functions for styling
function getRainfallBarHeight(rainfall: number | null): string {
  if (rainfall === null) return '0%'
  
  // Scale rainfall bar based on typical range (0 to 50mm per hour)
  const maxRainfall = 50
  const normalizedRainfall = Math.max(0, Math.min(100, (rainfall / maxRainfall) * 100))
  
  return `${normalizedRainfall}%`
}

function getRainfallColor(rainfall: number | null): string {
  if (rainfall === null) return '#64748b'
  
  if (rainfall <= 0.1) return '#10b981' // Green - No rain/trace
  if (rainfall <= 2.5) return '#3b82f6' // Blue - Light rain
  if (rainfall <= 10) return '#f59e0b' // Yellow - Moderate rain
  if (rainfall <= 30) return '#ef4444' // Red - Heavy rain
  return '#dc2626' // Dark red - Intense rain
}

function getRainfallStatus(rainfall: number | null): { text: string; class: string } {
  if (rainfall === null) return { text: 'No Data', class: 'bg-slate-600 shadow-[0_0_10px_rgba(100,116,139,0.4)]' }
  
  if (rainfall <= 0.1) return { text: 'No Rain', class: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' }
  if (rainfall <= 2.5) return { text: 'Light Rain', class: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]' }
  if (rainfall <= 10) return { text: 'Moderate', class: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' }
  if (rainfall <= 30) return { text: 'Heavy Rain', class: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]' }
  return { text: 'Intense Rain', class: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' }
}

// Close table function
function closeTable() {
  emit('close-table')
}

// Fetch rainfall data for today
async function fetchRainfallData(stationId: string) {
  isLoading.value = true
  
  try {
    
    
    // Initialize data with empty slots
    rainfallData.value = generateHourlySlots()

    const rainfallRef = dbRef(db, `${stationId}/data/sensors/RR`)
    
    // Get today's data - accounting for UTC storage
    const now = new Date()
    const todayStartLocal = getTodayStartTimestamp()
    const todayStartUTC = todayStartLocal + (8 * 60 * 60) // Add 8 hours to convert to UTC
    
  
    
    const todayQuery = query(rainfallRef, orderByKey(), startAt(todayStartUTC.toString()))
    const snapshot = await get(todayQuery)
    
    const hourMap: Record<number, number[]> = {}
    let totalEntries = 0
    let validEntries = 0
    
    if (snapshot.exists()) {
      snapshot.forEach(child => {
        totalEntries++
        const val = child.val()
        const timestamp = parseInt(child.key || '0')
        
        let rainfall = 0
        if (typeof val === 'object' && val !== null && val.val !== undefined) {
          rainfall = parseFloat(val.val) || 0
        } else if (typeof val === 'number') {
          rainfall = val
        } else if (typeof val === 'string') {
          rainfall = parseFloat(val) || 0
        }

        if (rainfall >= 0) {
          validEntries++
          
          const date = getLocalDate(timestamp)
          const adjustedDate = new Date(date.getTime() - 8 * 60 * 60 * 1000)
          const hour = adjustedDate.getHours()
          
          const entryDate = new Date(adjustedDate.getFullYear(), adjustedDate.getMonth(), adjustedDate.getDate())
          const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          
          if (entryDate.getTime() === todayDate.getTime()) {
            if (!hourMap[hour]) hourMap[hour] = []
            hourMap[hour].push(rainfall)
          }
        }
      })
      
     
      
      // Calculate total rainfall for each hour
      rainfallData.value.forEach(entry => {
        if (hourMap[entry.hour] && hourMap[entry.hour].length > 0) {
          const totalRainfall = hourMap[entry.hour].reduce((a, b) => a + b, 0)
          entry.rainfall = Math.round(totalRainfall * 100) / 100
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
    fetchRainfallData(newId)
  }
}, { immediate: true })

onMounted(() => {
  if (props.stationId) {
    fetchRainfallData(props.stationId)
  }
  
  // Emit animation complete after mount animation
  setTimeout(() => {
    emit('animation-complete')
  }, 1000)
})

defineExpose({ fetchRainfallData })
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
