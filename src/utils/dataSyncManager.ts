/**
 * Data Sync Manager
 * Handles synchronization between Firebase and local SQLite database
 */

import { db as database } from '../services/database';
import { ref as dbRef, query, orderByKey, limitToLast, startAt, endAt, get, onValue } from 'firebase/database';
import { db as firebaseDb } from '../firebase';

export class DataSyncManager {
  private isSyncing = false;
  private lastSyncTime: Record<string, number> = {};
  private syncInterval: Record<string, NodeJS.Timeout> = {};

  /**
   * Initialize the sync manager
   */
  async initialize(): Promise<void> {
    try {
      await database.initialize();
      console.log('✅ DataSyncManager initialized');
    } catch (error) {
      console.error('❌ DataSyncManager initialization failed:', error);
      throw error;
    }
  }

  /**
   * Sync all sensor data from Firebase to SQLite
   */
  async syncAllStationData(stationId: string): Promise<boolean> {
    if (this.isSyncing) {
      console.log('⏳ Sync already in progress');
      return false;
    }

    this.isSyncing = true;
    console.log(`🔄 Starting sync for station: ${stationId}`);

    try {
      const sensorTypes = [
        { key: 'TEM', label: 'temperature' },
        { key: 'HUM', label: 'humidity' },
        { key: 'RR', label: 'rainfall' },
        { key: 'WSP', label: 'windSpeed' },
        { key: 'WD', label: 'windDirection' },
        { key: 'ATM', label: 'pressure' },
        { key: 'LUX', label: 'illumination' },
        { key: 'TSR', label: 'solar' },
        { key: 'SMD', label: 'soilMoisture' },
        { key: 'STD', label: 'soilTemp' },
        { key: 'WA', label: 'windAngle' }
      ];

      const stationData: Record<string, any> = {};
      const latestReadings: Record<string, any> = {};

      // Fetch latest reading for each sensor
      for (const sensor of sensorTypes) {
        try {
          const sensorRef = dbRef(firebaseDb, `${stationId}/data/sensors/${sensor.key}`);
          const q = query(sensorRef, orderByKey(), limitToLast(1));
          const snapshot = await get(q);

          if (snapshot.exists()) {
            const data = snapshot.val();
            
            // Handle nested structure
            Object.entries(data).forEach(([timestamp, value]: [string, any]) => {
              let finalValue: any = value?.val ?? value ?? 0;

              // Convert to number if not wind direction
              if (sensor.key !== 'WD' && typeof finalValue === 'string') {
                finalValue = parseFloat(finalValue) || 0;
              }

              const ts = parseInt(timestamp);
              
              // Save sensor reading to local database
              database.saveSensorReading({
                stationId,
                timestamp: ts,
                sensor: sensor.key,
                value: finalValue
              }).catch(err => console.warn(`Failed to save ${sensor.key} reading:`, err));

              // Track latest reading
              latestReadings[sensor.label] = {
                value: finalValue,
                timestamp: ts
              };
            });
          }
        } catch (error) {
          console.warn(`Failed to sync ${sensor.key}:`, error);
        }
      }

      // Calculate heat index
      const temperature = latestReadings.temperature?.value ?? 0;
      const humidity = latestReadings.humidity?.value ?? 0;
      const heatIndex = this.calculateHeatIndex(temperature, humidity);

      // Get the earliest timestamp from the latest readings
      let earliestTimestamp = Date.now() / 1000;
      Object.values(latestReadings).forEach((reading: any) => {
        if (reading.timestamp && reading.timestamp < earliestTimestamp) {
          earliestTimestamp = reading.timestamp;
        }
      });

      // Save aggregated station data
      await database.saveStationData({
        stationId,
        temperature: latestReadings.temperature?.value ?? 0,
        humidity: latestReadings.humidity?.value ?? 0,
        rainfall: latestReadings.rainfall?.value ?? 0,
        windSpeed: latestReadings.windSpeed?.value ?? 0,
        windDirection: latestReadings.windDirection?.value ?? 'N',
        pressure: latestReadings.pressure?.value ?? 0,
        solar: latestReadings.solar?.value ?? 0,
        illumination: latestReadings.illumination?.value ?? 0,
        soilMoisture: latestReadings.soilMoisture?.value ?? 0,
        soilTemp: latestReadings.soilTemp?.value ?? 0,
        windAngle: latestReadings.windAngle?.value ?? 0,
        heatIndex: heatIndex,
        timestamp: earliestTimestamp,
        syncedAt: Math.floor(Date.now() / 1000)
      });

      // Update sync status
      await database.updateSyncStatus(stationId, 'synced');
      this.lastSyncTime[stationId] = Date.now();

      console.log(`✅ Sync completed for station: ${stationId}`);
      this.isSyncing = false;
      return true;
    } catch (error) {
      console.error(`❌ Sync failed for station ${stationId}:`, error);
      await database.updateSyncStatus(stationId, 'error', String(error));
      this.isSyncing = false;
      return false;
    }
  }

  /**
   * Sync historical data for 7-day summary
   */
  async sync7DaySummary(stationId: string): Promise<boolean> {
    console.log(`🔄 Starting 7-day sync for station: ${stationId}`);

    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      const sevenDaysAgoStart = new Date(
        sevenDaysAgo.getFullYear(),
        sevenDaysAgo.getMonth(),
        sevenDaysAgo.getDate()
      );
      const sevenDaysAgoTimestamp = Math.floor(sevenDaysAgoStart.getTime() / 1000) + (8 * 60 * 60);

      const yesterdayEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
        23,
        59,
        59
      );
      const yesterdayEndTimestamp = Math.floor(yesterdayEnd.getTime() / 1000) + (8 * 60 * 60);

      const sensorTypes = [
        { key: 'TEM', label: 'temperature' },
        { key: 'HUM', label: 'humidity' },
        { key: 'RR', label: 'rainfall' },
        { key: 'WSP', label: 'windSpeed' },
        { key: 'WD', label: 'windDirection' }
      ];

      // Fetch data for each sensor
      const allReadings: Record<string, any[]> = {};

      for (const sensor of sensorTypes) {
        try {
          const sensorRef = dbRef(firebaseDb, `${stationId}/data/sensors/${sensor.key}`);
          const q = query(
            sensorRef,
            orderByKey(),
            startAt(sevenDaysAgoTimestamp.toString()),
            endAt(yesterdayEndTimestamp.toString())
          );
          const snapshot = await get(q);

          if (snapshot.exists()) {
            const data = snapshot.val();
            
            Object.entries(data).forEach(([timestamp, value]: [string, any]) => {
              let finalValue: any = value?.val ?? value ?? 0;

              if (sensor.key !== 'WD' && typeof finalValue === 'string') {
                finalValue = parseFloat(finalValue) || 0;
              }

              const ts = parseInt(timestamp);
              
              // Save to local database
              database.saveSensorReading({
                stationId,
                timestamp: ts,
                sensor: sensor.key,
                value: finalValue
              }).catch(err => console.warn(`Failed to save historical ${sensor.key} reading:`, err));

              // Store for daily aggregation
              if (!allReadings[sensor.label]) {
                allReadings[sensor.label] = [];
              }
              allReadings[sensor.label].push({
                timestamp: ts,
                value: finalValue
              });
            });
          }
        } catch (error) {
          console.warn(`Failed to sync historical ${sensor.key}:`, error);
        }
      }

      // Aggregate by day
      const dailyData: Record<string, any> = {};

      Object.entries(allReadings).forEach(([sensor, readings]: [string, any[]]) => {
        readings.forEach(reading => {
          const date = new Date(reading.timestamp * 1000);
          const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

          if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
              temperature: [],
              humidity: [],
              rainfall: [],
              windSpeed: [],
              windDirection: []
            };
          }

          if (sensor === 'temperature') {
            dailyData[dateKey].temperature.push(reading.value);
          } else if (sensor === 'humidity') {
            dailyData[dateKey].humidity.push(reading.value);
          } else if (sensor === 'rainfall') {
            dailyData[dateKey].rainfall.push(reading.value);
          } else if (sensor === 'windSpeed') {
            dailyData[dateKey].windSpeed.push(reading.value);
          } else if (sensor === 'windDirection') {
            dailyData[dateKey].windDirection.push(reading.value);
          }
        });
      });

      // Save daily summaries
      for (const [date, data] of Object.entries(dailyData)) {
        const avgTemp = data.temperature.length > 0
          ? data.temperature.reduce((a: number, b: number) => a + b, 0) / data.temperature.length
          : 0;
        
        const avgHumidity = data.humidity.length > 0
          ? data.humidity.reduce((a: number, b: number) => a + b, 0) / data.humidity.length
          : 0;
        
        const totalRainfall = data.rainfall.length > 0
          ? data.rainfall.reduce((a: number, b: number) => a + b, 0)
          : 0;
        
        const avgWindSpeed = data.windSpeed.length > 0
          ? data.windSpeed.reduce((a: number, b: number) => a + b, 0) / data.windSpeed.length
          : 0;
        
        const windDir = data.windDirection.length > 0 ? data.windDirection[0] : 'N';

        await database.saveDailySummary({
          stationId,
          date,
          avgTemperature: parseFloat(avgTemp.toFixed(2)),
          avgHumidity: parseFloat(avgHumidity.toFixed(2)),
          totalRainfall: parseFloat(totalRainfall.toFixed(2)),
          avgWindSpeed: parseFloat(avgWindSpeed.toFixed(2)),
          windDirection: windDir
        });
      }

      console.log(`✅ 7-day sync completed for station: ${stationId}`);
      return true;
    } catch (error) {
      console.error(`❌ 7-day sync failed for station ${stationId}:`, error);
      return false;
    }
  }

  /**
   * Get station data from local cache
   */
  async getLocalStationData(stationId: string): Promise<any | null> {
    try {
      return await database.getStationData(stationId);
    } catch (error) {
      console.error('Error getting local station data:', error);
      return null;
    }
  }

  /**
   * Get all local station data
   */
  async getAllLocalStationData(): Promise<any[]> {
    try {
      return await database.getAllStationData();
    } catch (error) {
      console.error('Error getting all local station data:', error);
      return [];
    }
  }

  /**
   * Get local 7-day summary
   */
  async getLocal7DaySummary(stationId: string): Promise<any[]> {
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      const sevenDaysAgoDate = sevenDaysAgo.toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];

      return await database.getDailySummaries(stationId, sevenDaysAgoDate, today);
    } catch (error) {
      console.error('Error getting local 7-day summary:', error);
      return [];
    }
  }

  /**
   * Setup auto-sync for a station
   */
  setupAutoSync(stationId: string, intervalMinutes: number = 10): void {
    if (this.syncInterval[stationId]) {
      clearInterval(this.syncInterval[stationId]);
    }

    this.syncInterval[stationId] = setInterval(async () => {
      try {
        await this.syncAllStationData(stationId);
      } catch (error) {
        console.error('Auto-sync error:', error);
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`✅ Auto-sync setup for station ${stationId} every ${intervalMinutes} minutes`);
  }

  /**
   * Stop auto-sync for a station
   */
  stopAutoSync(stationId: string): void {
    if (this.syncInterval[stationId]) {
      clearInterval(this.syncInterval[stationId]);
      delete this.syncInterval[stationId];
      console.log(`✅ Auto-sync stopped for station ${stationId}`);
    }
  }

  /**
   * Get last sync time for a station
   */
  getLastSyncTime(stationId: string): number | null {
    return this.lastSyncTime[stationId] || null;
  }

  /**
   * Calculate heat index
   */
  private calculateHeatIndex(T: number, RH: number): number {
    if (typeof T !== 'number' || typeof RH !== 'number' || T === 0 || RH === 0) {
      return 0;
    }

    if (isNaN(T) || isNaN(RH)) {
      return 0;
    }

    const T_F = (T * 9 / 5) + 32;
    const HI_F = -42.379 + 2.04901523 * T_F + 10.14333127 * RH 
      - 0.22475541 * T_F * RH - 0.00683783 * T_F * T_F 
      - 0.05481717 * RH * RH + 0.00122874 * T_F * T_F * RH 
      + 0.00085282 * T_F * RH * RH - 0.00000199 * T_F * T_F * RH * RH;
    
    return parseFloat((((HI_F) - 32) * 5 / 9).toFixed(2)) || 0;
  }

  /**
   * Clear old data from cache
   */
  async clearOldData(daysToKeep: number = 30): Promise<void> {
    try {
      await database.clearOldData(daysToKeep);
      console.log(`✅ Cleared data older than ${daysToKeep} days`);
    } catch (error) {
      console.error('Error clearing old data:', error);
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<any> {
    try {
      return await database.getStats();
    } catch (error) {
      console.error('Error getting database stats:', error);
      return null;
    }
  }

  /**
   * Stop all syncing
   */
  stopAll(): void {
    Object.keys(this.syncInterval).forEach(stationId => {
      this.stopAutoSync(stationId);
    });
    console.log('✅ All auto-sync stopped');
  }
}

// Export singleton instance
export const syncManager = new DataSyncManager();
