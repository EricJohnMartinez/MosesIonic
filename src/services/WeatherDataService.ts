import { getDatabase, ref as dbRef, get, query, orderByKey, startAt, endAt } from 'firebase/database';
import { SQLiteService, WeatherData } from './SQLiteService';
import { networkService } from './NetworkService';

export interface SummaryData {
  date: Date;
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  windDirection: string;
}

export class WeatherDataService {
  private sqliteService: SQLiteService;

  constructor() {
    this.sqliteService = new SQLiteService();
  }

  async initialize(): Promise<void> {
    await this.sqliteService.initialize();
  }

  async getSummaryData(stationId: string, forceRefresh: boolean = false): Promise<SummaryData[]> {
    const cacheKey = `summaryData_${stationId}`;

    // If online and force refresh, or if we don't have cached data, fetch from Firebase
    if ((networkService.online && forceRefresh) || !(await this.sqliteService.isDataAvailable(stationId))) {
      if (networkService.online) {
        console.log('WeatherDataService: Fetching fresh data from Firebase');
        const freshData = await this.fetchFromFirebase(stationId);
        await this.sqliteService.saveWeatherData(freshData);
        return this.convertToSummaryData(freshData);
      } else {
        console.log('WeatherDataService: Offline and no cached data available');
        return [];
      }
    } else {
      // Load from SQLite cache
      console.log('WeatherDataService: Loading data from SQLite cache');
      const cachedData = await this.sqliteService.getWeatherData(stationId);
      return this.convertToSummaryData(cachedData);
    }
  }

  private async fetchFromFirebase(stationId: string): Promise<WeatherData[]> {
    const db = getDatabase();

    // Define sensor types like in SummaryPage.vue
    const sensorTypes = [
      { key: 'TEM', label: 'temperature' },
      { key: 'HUM', label: 'humidity' },
      { key: 'RR', label: 'rainfall' },
      { key: 'WSP', label: 'windSpeed' },
      { key: 'WD', label: 'windDirection' }
    ];

    const allSensorData: any[] = [];

    // Fetch data for each sensor type
    for (const sensor of sensorTypes) {
      try {
        const sensorRef = dbRef(db, `${stationId}/data/sensors/${sensor.key}`);
        console.log(`WeatherDataService: Fetching ${sensor.key} from path:`, `${stationId}/data/sensors/${sensor.key}`);

        // Get data from the last 7 days (October 10 to 16 for October 17)
        // Handle timezone conversion (Firebase stores in UTC, we need Philippines time UTC+8)
        const now = new Date();
        const sevenDaysAgoLocal = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const sevenDaysAgoLocalStart = new Date(sevenDaysAgoLocal.getFullYear(), sevenDaysAgoLocal.getMonth(), sevenDaysAgoLocal.getDate());
        const sevenDaysAgoUTC = Math.floor(sevenDaysAgoLocalStart.getTime() / 1000) + (8 * 60 * 60); // Convert to UTC timestamp

        // Calculate yesterday's end time
        const yesterdayLocal = new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000));
        const yesterdayLocalEnd = new Date(yesterdayLocal.getFullYear(), yesterdayLocal.getMonth(), yesterdayLocal.getDate(), 23, 59, 59);
        const yesterdayEndUTC = Math.floor(yesterdayLocalEnd.getTime() / 1000) + (8 * 60 * 60); // Convert to UTC timestamp

        const sensorQuery = query(sensorRef, orderByKey(), startAt(sevenDaysAgoUTC.toString()), endAt(yesterdayEndUTC.toString()));

        const snapshot = await get(sensorQuery);

        if (snapshot.exists()) {
          const sensorData = snapshot.val();
          console.log(`WeatherDataService: Found ${sensor.key} data:`, sensorData);

          // Process each timestamp for this sensor
          Object.entries(sensorData).forEach(([timestamp, value]: [string, any]) => {
            // Handle nested Firebase structure
            let finalValue: any = value?.val ?? value ?? 0;
            if (sensor.key !== 'WD' && typeof finalValue === 'string') {
              finalValue = parseFloat(finalValue) || 0;
            }

            // Convert timestamp from UTC to local time (subtract 8 hours for Philippines UTC+8)
            const utcTimestamp = parseInt(timestamp);
            const localTimestamp = utcTimestamp - (8 * 60 * 60); // Convert from UTC to Philippines time
            const localDate = new Date(localTimestamp * 1000);

            allSensorData.push({
              timestamp: localDate.getTime(), // Store as milliseconds for JavaScript Date
              sensor: sensor.key,
              value: finalValue
            });
          });
        } else {
          console.log(`WeatherDataService: No ${sensor.key} data found`);
        }
      } catch (sensorError) {
        console.error(`WeatherDataService: Error fetching ${sensor.key}:`, sensorError);
      }
    }

    console.log('WeatherDataService: All sensor data collected:', allSensorData);

    if (allSensorData.length === 0) {
      console.log('WeatherDataService: No sensor data found at all');
      return [];
    }

    // Group data by date and sensor type
    const dailyData: { [key: string]: { [sensor: string]: any[] } } = {};

    allSensorData.forEach(data => {
      const date = new Date(data.timestamp).toDateString(); // timestamp is already in milliseconds (local time)
      console.log(`WeatherDataService: Processing timestamp ${data.timestamp} -> date: ${date} (local time)`);

      if (!dailyData[date]) {
        dailyData[date] = {};
      }

      if (!dailyData[date][data.sensor]) {
        dailyData[date][data.sensor] = [];
      }

      dailyData[date][data.sensor].push(data.value);
    });

    console.log('WeatherDataService: Daily data grouped by sensor:', dailyData);

    // Calculate daily averages for each sensor
    const processedData: WeatherData[] = [];

    Object.entries(dailyData).forEach(([date, sensorData]) => {
      const dayData: WeatherData = {
        stationId,
        date,
        temperature: 0,
        humidity: 0,
        rainfall: 0,
        windSpeed: 0,
        windDirection: 'N',
        timestamp: new Date(date).getTime()
      };

      // Calculate averages for each sensor
      Object.entries(sensorData).forEach(([sensor, values]: [string, any[]]) => {
        if (sensor === 'TEM' && values.length > 0) {
          dayData.temperature = parseFloat((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2));
        } else if (sensor === 'HUM' && values.length > 0) {
          dayData.humidity = parseFloat((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2));
        } else if (sensor === 'RR' && values.length > 0) {
          dayData.rainfall = parseFloat(values.reduce((sum, val) => sum + val, 0).toFixed(2)); // Sum rainfall
        } else if (sensor === 'WSP' && values.length > 0) {
          dayData.windSpeed = parseFloat((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2));
        } else if (sensor === 'WD' && values.length > 0) {
          // Get most common wind direction
          const windDirs = values.filter(v => v && v !== 'N');
          dayData.windDirection = windDirs.length > 0 ? windDirs[0] : 'N';
        }
      });

      processedData.push(dayData);
    });

    // Sort by date (oldest first)
    processedData.sort((a, b) => a.timestamp - b.timestamp);

    console.log('WeatherDataService: Final processed data:', processedData);
    console.log('WeatherDataService: Summary data length:', processedData.length);

    return processedData;
  }

  private convertToSummaryData(weatherData: WeatherData[]): SummaryData[] {
    return weatherData.map(data => ({
      date: new Date(data.date),
      temperature: data.temperature,
      humidity: data.humidity,
      rainfall: data.rainfall,
      windSpeed: data.windSpeed,
      windDirection: data.windDirection
    }));
  }

  async syncDataIfOnline(stationId: string): Promise<void> {
    if (networkService.online) {
      console.log('WeatherDataService: Syncing data for station:', stationId);
      try {
        const freshData = await this.fetchFromFirebase(stationId);
        await this.sqliteService.saveWeatherData(freshData);
        console.log('WeatherDataService: Data synced successfully');
      } catch (error) {
        console.error('WeatherDataService: Failed to sync data:', error);
      }
    }
  }

  async clearOldData(): Promise<void> {
    await this.sqliteService.clearOldData();
  }

  get networkStatus() {
    return {
      online: networkService.online,
      offline: networkService.offline,
      connectionType: networkService.connectionTypeValue
    };
  }
}

// Singleton instance
export const weatherDataService = new WeatherDataService();