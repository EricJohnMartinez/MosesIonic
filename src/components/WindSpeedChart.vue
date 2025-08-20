<template>
  <div class="wind-chart-container">
    <!-- Header Section -->
    <div class="chart-header">
      <div class="header-content">
        <div class="title-section">
          <h3 class="chart-title">Wind Speed Monitoring</h3>
        </div>
        <div class="current-stats">
          <div class="stat-card">
            <span class="stat-label">Average Peak Today</span>
            <span class="stat-value text-center">{{ peakWindSpeed }} m/s</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="chart-wrapper">
      <div class="loading-overlay" v-if="isLoading">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading wind data...</p>
      </div>
      <apexchart 
        v-else
        type="area" 
        height="300" 
        :options="chartOptions" 
        :series="series" 
        class="wind-chart"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { db } from '../firebase'
import { ref as dbRef, query, orderByKey, get, startAt, endAt } from 'firebase/database'

const props = defineProps<{ stationId: string }>()

const isLoading = ref(true)
const lastUpdated = ref('');
const series = ref([
  {
    name: 'Wind Speed',
    data: [] as number[],
  },
]);
const chartOptions = ref({
  chart: {
    type: 'line',
    height: 350,
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  // Series color and tooltip style for better contrast on dark backgrounds
  colors: ['#60A5FA'],
  xaxis: {
    categories: [],
    labels: {
      style: { colors: '#fff' },
    },
  },
  yaxis: {
    labels: {
      // hide numeric labels on the y-axis (e.g. 1.00, 0.80, ...)
      show: false,
      style: { colors: '#fff' },
    },
  },
  tooltip: {
  theme: 'dark',
    x: {
      formatter: function (value: any) {
        return value;
      },
    },
  },
  grid: {
  
  borderColor: 'rgba(255,255,255,0.12)',
    strokeDashArray: 5,
  },
});

// Computed properties
const currentWindSpeed = computed(() => {
  const data = series.value[0].data;
  return data.length > 0 ? data[data.length - 1] : 0;
});

const peakWindSpeed = computed(() => {
  const data = series.value[0].data;
  return data.length > 0 ? Math.max(...data) : 0;
});

// Fetch today's hourly averages only
async function fetchWindSpeedData(stationId: string) {
  isLoading.value = true;
  try {
    const now = new Date();

    // Get today's start (midnight local)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startEpoch = Math.floor(todayStart.getTime() / 1000); // seconds
    const endEpoch = Math.floor(now.getTime() / 1000); // now in seconds

    console.log(`Fetching data between ${startEpoch} and ${endEpoch}`);

    // Firebase query: only today's records
    const wspRef = dbRef(db, `${stationId}/data/sensors/WSP`);
    const wspQuery = query(
      wspRef,
      orderByKey(),
      startAt(startEpoch.toString()),
      endAt(endEpoch.toString())
    );
    const snapshot = await get(wspQuery);

    // Prepare hourly buckets
    const currentHour = now.getHours();
    const hourMap: Record<number, number[]> = {};
    for (let h = 0; h <= currentHour; h++) {
      hourMap[h] = [];
    }

    if (snapshot.exists()) {
      snapshot.forEach(child => {
        const val = child.val();
        let windSpeed = 0;
        let timestamp = parseInt(child.key || '0');

        if (typeof val === 'object' && val !== null) {
          windSpeed = parseFloat(val.val ?? val.value ?? val) || 0;
        } else {
          windSpeed = parseFloat(val) || 0;
        }

        if (windSpeed > 0 && timestamp > 0) {
          // Convert to local time (GMT+8 adjustment if needed)
          const localTimestamp = timestamp * 1000; // ms
          const date = new Date(localTimestamp);

          if (
            date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          ) {
            const hour = date.getHours();
            if (hour >= 0 && hour <= currentHour) {
              hourMap[hour].push(windSpeed);
            }
          }
        }
      });
    }

    // Calculate averages
    const data: number[] = [];
    const categories: string[] = [];

    for (let h = 0; h <= currentHour; h++) {
      if (hourMap[h].length > 0) {
        const avg = hourMap[h].reduce((a, b) => a + b, 0) / hourMap[h].length;
        data.push(Number(avg.toFixed(2)));
      } else {
        data.push(0);
      }

      // Format category label
      let hour12 = h % 12;
      if (hour12 === 0) hour12 = 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      categories.push(`${hour12}:00 ${ampm}`);
    }

    series.value[0].data = data;
    (chartOptions.value.xaxis.categories as any) = categories;
    lastUpdated.value = now.toLocaleTimeString();

    console.log('Final chart data:', { categories, data });

  } catch (error) {
    console.error('Error fetching wind speed data:', error);
  } finally {
    isLoading.value = false;
  }
}

// Auto-fetch when stationId changes
watch(() => props.stationId, (newId) => {
  if (newId) {
    fetchWindSpeedData(newId);
  }
}, { immediate: true }); // run immediately on mount

// Ensure we fetch once on mounted if data is not yet loaded (guard against duplicate fetch)
onMounted(() => {
  if (props.stationId && series.value[0].data.length === 0) {
    fetchWindSpeedData(props.stationId);
  }
});

// Expose the fetch function to parent components (so parent can trigger a refresh)
// e.g. parent can call childRef.fetchWindSpeedData(stationId)
defineExpose({ fetchWindSpeedData });
</script>

<style scoped>
.wind-chart-container {
  width: 100%;
  background-color: #00000046;
  border-radius: 0.75rem;
  overflow: hidden;
}

.chart-header {
  background-color: #0000002d;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.current-stats {
  display: flex;
  gap: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0);
  padding: 0.5rem 0.75rem;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  display: block;
  font-size: 1.125rem;
  font-weight: bold;
  color: #ffffff;
  margin-top: 0.25rem;
}

.chart-wrapper {
  position: relative;
  padding: 1rem;
  min-height: 300px;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0);
  z-index: 10;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border-width: 3px;
  border-style: solid;
  border-color: #bfdbfe;
  border-top-color: #2563eb;
  border-radius: 9999px;
  animation: spin 1s linear infinite;
  margin-bottom: 0.75rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #fdfeff;
  font-size: 0.875rem;
}

.wind-chart {
  border-radius: 0.5rem;
}
</style>
