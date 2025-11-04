import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export interface WeatherData {
  id?: number;
  stationId: string;
  date: string; // ISO date string
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  windDirection: string;
  timestamp: number; // Unix timestamp
}

export class SQLiteService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private readonly dbName = 'weather_data.db';
  private readonly dbVersion = 1;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initialize(): Promise<void> {
    try {
      // Create connection
      this.db = await this.sqlite.createConnection(
        this.dbName,
        false,
        'no-encryption',
        this.dbVersion,
        false
      );

      // Open database
      await this.db.open();

      // Create tables
      await this.createTables();

      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS weather_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_id TEXT NOT NULL,
        date TEXT NOT NULL,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        rainfall REAL NOT NULL,
        wind_speed REAL NOT NULL,
        wind_direction TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        UNIQUE(station_id, date)
      );

      CREATE INDEX IF NOT EXISTS idx_station_date ON weather_data(station_id, date);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON weather_data(timestamp);
    `;

    await this.db.execute(createTableQuery);
  }

  async saveWeatherData(data: WeatherData[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.beginTransaction();

      for (const item of data) {
        const query = `
          INSERT OR REPLACE INTO weather_data
          (station_id, date, temperature, humidity, rainfall, wind_speed, wind_direction, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          item.stationId,
          item.date,
          item.temperature,
          item.humidity,
          item.rainfall,
          item.windSpeed,
          item.windDirection,
          item.timestamp
        ];

        await this.db.run(query, values);
      }

      await this.db.commitTransaction();
      console.log(`Saved ${data.length} weather data records to SQLite`);
    } catch (error) {
      await this.db.rollbackTransaction();
      console.error('Failed to save weather data:', error);
      throw error;
    }
  }

  async getWeatherData(stationId: string, days: number = 7): Promise<WeatherData[]> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Get data from the last N days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const query = `
        SELECT * FROM weather_data
        WHERE station_id = ?
        AND timestamp >= ?
        ORDER BY date ASC
      `;

      const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000);
      const result = await this.db.query(query, [stationId, cutoffTimestamp]);

      return result.values?.map(row => ({
        id: row.id,
        stationId: row.station_id,
        date: row.date,
        temperature: row.temperature,
        humidity: row.humidity,
        rainfall: row.rainfall,
        windSpeed: row.wind_speed,
        windDirection: row.wind_direction,
        timestamp: row.timestamp
      })) || [];
    } catch (error) {
      console.error('Failed to get weather data:', error);
      throw error;
    }
  }

  async getLatestWeatherData(stationId: string): Promise<WeatherData | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const query = `
        SELECT * FROM weather_data
        WHERE station_id = ?
        ORDER BY timestamp DESC
        LIMIT 1
      `;

      const result = await this.db.query(query, [stationId]);
      const row = result.values?.[0];

      if (!row) return null;

      return {
        id: row.id,
        stationId: row.station_id,
        date: row.date,
        temperature: row.temperature,
        humidity: row.humidity,
        rainfall: row.rainfall,
        windSpeed: row.wind_speed,
        windDirection: row.wind_direction,
        timestamp: row.timestamp
      };
    } catch (error) {
      console.error('Failed to get latest weather data:', error);
      throw error;
    }
  }

  async clearOldData(daysToKeep: number = 30): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const cutoffTimestamp = Math.floor(cutoffDate.getTime() / 1000);

      const query = 'DELETE FROM weather_data WHERE timestamp < ?';
      await this.db.run(query, [cutoffTimestamp]);

      console.log('Cleared old weather data from SQLite');
    } catch (error) {
      console.error('Failed to clear old data:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      try {
        await this.db.close();
        this.db = null;
        console.log('SQLite database connection closed');
      } catch (error) {
        console.error('Failed to close database:', error);
      }
    }
  }

  async isDataAvailable(stationId: string, days: number = 7): Promise<boolean> {
    if (!this.db) return false;

    try {
      const data = await this.getWeatherData(stationId, days);
      return data.length > 0;
    } catch (error) {
      console.error('Failed to check data availability:', error);
      return false;
    }
  }
}

// Singleton instance
export const sqliteService = new SQLiteService();