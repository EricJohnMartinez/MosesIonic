<template>
  <div class="bg-gray-800 text-white p-4 rounded-lg">
    <h3 class="text-lg font-bold mb-4">Firebase Data Debug</h3>
    
    <div class="mb-4">
      <button @click="testConnection" class="bg-blue-600 px-4 py-2 rounded">
        Test Firebase Connection
      </button>
    </div>
    
    <div v-if="loading" class="mb-4">
      <p>Loading data...</p>
    </div>
    
    <div v-if="rawData" class="mb-4">
      <h4 class="font-semibold">Raw Firebase Data (latest 5 entries):</h4>
      <pre class="bg-gray-900 p-2 rounded text-xs overflow-auto max-h-40">{{ rawData }}</pre>
    </div>
    
    <div v-if="processedData.length > 0" class="mb-4">
      <h4 class="font-semibold">Processed Temperature Data (latest 10):</h4>
      <div class="grid grid-cols-1 gap-2">
        <div v-for="entry in processedData" :key="entry.timestamp" 
             class="bg-gray-700 p-2 rounded text-sm">
          <p>Time (converted): {{ entry.timeString }}</p>
          <p>Time (direct): {{ entry.timestampDirect }}</p>
          <p>Timestamp: {{ entry.timestamp }}</p>
          <p>Temp: {{ entry.temperature }}°C</p>
          <p>Raw: {{ JSON.stringify(entry.rawValue) }}</p>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="text-red-400">
      <h4 class="font-semibold">Error:</h4>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { db } from '../firebase'
import { ref as dbRef, query, orderByKey, limitToLast, get, startAt } from 'firebase/database'
import { addHours, getUnixTime, startOfDay, format, fromUnixTime } from 'date-fns'

const props = defineProps<{
  stationId: string
}>()

const loading = ref(false)
const rawData = ref<any>(null)
const processedData = ref<any[]>([])
const error = ref<string>('')

// Helper functions (same as Weather.vue)
function convertToUnixTime(date: Date): number {
  return getUnixTime(addHours(date, 8))
}

function convertToDateTime(unixTimestamp: number): Date {
  return addHours(fromUnixTime(unixTimestamp), 16)
}

function formatTime(timestamp: number) {
  return format(convertToDateTime(timestamp), 'HH:mm:ss')
}

async function testConnection() {
  loading.value = true
  error.value = ''
  rawData.value = null
  processedData.value = []
  
  try {
    console.log('Testing connection to:', `${props.stationId}/data/sensors/TEM`)
    
    // Test 1: Get latest 10 entries to see what data looks like
    const tempRef = dbRef(db, `${props.stationId}/data/sensors/TEM`)
    const latestQuery = query(tempRef, orderByKey(), limitToLast(10))
    
    const snapshot = await get(latestQuery)
    
    if (snapshot.exists()) {
      const data: any = {}
      const processed: any[] = []
      
      snapshot.forEach(child => {
        const val = child.val()
        const timestamp = parseInt(child.key || '0')
        
        data[child.key || 'unknown'] = val
        
        let temperature = 0
        if (typeof val === 'object' && val !== null && val.val !== undefined) {
          temperature = parseFloat(val.val) || 0
        } else if (typeof val === 'number') {
          temperature = val
        } else if (typeof val === 'string') {
          temperature = parseFloat(val) || 0
        }
        
        processed.push({
          timestamp,
          temperature,
          rawValue: val,
          timeString: format(convertToDateTime(timestamp), 'yyyy-MM-dd HH:mm:ss'),
          timestampDirect: format(new Date(timestamp * 1000), 'yyyy-MM-dd HH:mm:ss')
        })
      })
      
      rawData.value = JSON.stringify(data, null, 2)
      processedData.value = processed.reverse() // Latest first
      
      console.log('Raw data:', data)
      console.log('Processed data:', processed)
      
    } else {
      error.value = 'No data found in Firebase'
    }
    
    // Test 2: Check what today's range should be
    const now = new Date()
    const todayStart = startOfDay(now)
    const startEpoch = convertToUnixTime(todayStart)
    const endEpoch = convertToUnixTime(now)
    
    console.log('Current time:', format(now, 'yyyy-MM-dd HH:mm:ss'))
    console.log('Today start:', format(todayStart, 'yyyy-MM-dd HH:mm:ss'))
    console.log('Today start epoch:', startEpoch)
    console.log('Current epoch:', endEpoch)
    console.log('Converted back - start:', format(convertToDateTime(startEpoch), 'yyyy-MM-dd HH:mm:ss'))
    console.log('Converted back - now:', format(convertToDateTime(endEpoch), 'yyyy-MM-dd HH:mm:ss'))
    
    // Check if any of our latest entries fall within today's range
    const todayEntries = processedData.value.filter(entry => 
      entry.timestamp >= startEpoch && entry.timestamp <= endEpoch
    )
    console.log('Entries within today range:', todayEntries.length)
    
    
  } catch (err: any) {
    error.value = err.message || 'Unknown error occurred'
    console.error('Firebase test error:', err)
  } finally {
    loading.value = false
  }
}
</script>
