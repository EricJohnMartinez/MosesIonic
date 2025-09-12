// src/utils/weatherAlerts.ts
import { fcmService } from './fcm';

export interface WeatherAlert {
  id: string;
  type: 'heat' | 'rain' | 'wind' | 'temperature';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  threshold: number;
  currentValue: number;
  stationId: string;
  stationName: string;
  timestamp: number;
}

class WeatherAlertSystem {
  private activeAlerts: Map<string, WeatherAlert> = new Map();
  private alertHistory: WeatherAlert[] = [];
  private thresholds = {
    heat: {
      medium: 35,
      high: 38,
      critical: 42
    },
    rainfall: {
      medium: 50,
      high: 100,
      critical: 200
    },
    windSpeed: {
      medium: 10,
      high: 15,
      critical: 20
    },
    temperature: {
      low: 15,
      high: 40,
      critical: 45
    }
  };

  checkWeatherConditions(stationData: any, stationName: string, stationId: string) {
    const alerts: WeatherAlert[] = [];

    // Heat Index Alert
    if (stationData.heatIndex) {
      const heatAlert = this.checkHeatIndex(stationData.heatIndex, stationId, stationName);
      if (heatAlert) alerts.push(heatAlert);
    }

    // Rainfall Alert
    if (stationData.dailyRainfall) {
      const rainAlert = this.checkRainfall(stationData.dailyRainfall, stationId, stationName);
      if (rainAlert) alerts.push(rainAlert);
    }

    // Wind Speed Alert
    if (stationData.windSpeed) {
      const windAlert = this.checkWindSpeed(stationData.windSpeed, stationId, stationName);
      if (windAlert) alerts.push(windAlert);
    }

    // Temperature Alert
    if (stationData.temperature) {
      const tempAlert = this.checkTemperature(stationData.temperature, stationId, stationName);
      if (tempAlert) alerts.push(tempAlert);
    }

    // Process new alerts
    alerts.forEach(alert => this.processAlert(alert));
  }

  private checkHeatIndex(heatIndex: number, stationId: string, stationName: string): WeatherAlert | null {
    const { medium, high, critical } = this.thresholds.heat;
    let severity: 'medium' | 'high' | 'critical' | null = null;
    let title = '';
    let message = '';

    if (heatIndex >= critical) {
      severity = 'critical';
      title = '🚨 CRITICAL Heat Alert';
      message = `Dangerous heat conditions at ${stationName}. Heat index: ${heatIndex}°C. Seek immediate shelter and hydration.`;
    } else if (heatIndex >= high) {
      severity = 'high';
      title = '🔥 HIGH Heat Alert';
      message = `Very hot conditions at ${stationName}. Heat index: ${heatIndex}°C. Limit outdoor activities.`;
    } else if (heatIndex >= medium) {
      severity = 'medium';
      title = '☀️ Heat Advisory';
      message = `Hot weather detected at ${stationName}. Heat index: ${heatIndex}°C. Stay hydrated.`;
    }

    if (severity) {
      return {
        id: `heat-${stationId}-${Date.now()}`,
        type: 'heat',
        severity,
        title,
        message,
        threshold: severity === 'critical' ? critical : severity === 'high' ? high : medium,
        currentValue: heatIndex,
        stationId,
        stationName,
        timestamp: Date.now()
      };
    }

    return null;
  }

  private checkRainfall(dailyRainfall: number, stationId: string, stationName: string): WeatherAlert | null {
    const { medium, high, critical } = this.thresholds.rainfall;
    let severity: 'medium' | 'high' | 'critical' | null = null;
    let title = '';
    let message = '';

    if (dailyRainfall >= critical) {
      severity = 'critical';
      title = '🌊 CRITICAL Flood Warning';
      message = `Torrential rainfall at ${stationName}: ${dailyRainfall}mm today. Flood risk is very high. Avoid travel.`;
    } else if (dailyRainfall >= high) {
      severity = 'high';
      title = '🌧️ HIGH Rainfall Alert';
      message = `Heavy rainfall at ${stationName}: ${dailyRainfall}mm today. Monitor flood conditions.`;
    } else if (dailyRainfall >= medium) {
      severity = 'medium';
      title = '🌦️ Rainfall Advisory';
      message = `Moderate rainfall at ${stationName}: ${dailyRainfall}mm today. Use caution when traveling.`;
    }

    if (severity) {
      return {
        id: `rain-${stationId}-${Date.now()}`,
        type: 'rain',
        severity,
        title,
        message,
        threshold: severity === 'critical' ? critical : severity === 'high' ? high : medium,
        currentValue: dailyRainfall,
        stationId,
        stationName,
        timestamp: Date.now()
      };
    }

    return null;
  }

  private checkWindSpeed(windSpeed: number, stationId: string, stationName: string): WeatherAlert | null {
    const { medium, high, critical } = this.thresholds.windSpeed;
    let severity: 'medium' | 'high' | 'critical' | null = null;
    let title = '';
    let message = '';

    if (windSpeed >= critical) {
      severity = 'critical';
      title = '💨 CRITICAL Wind Warning';
      message = `Dangerous wind speeds at ${stationName}: ${windSpeed} m/s. Avoid outdoor activities.`;
    } else if (windSpeed >= high) {
      severity = 'high';
      title = '🌪️ HIGH Wind Alert';
      message = `Strong winds at ${stationName}: ${windSpeed} m/s. Use caution outdoors.`;
    } else if (windSpeed >= medium) {
      severity = 'medium';
      title = '💨 Wind Advisory';
      message = `Moderate winds at ${stationName}: ${windSpeed} m/s. Monitor conditions.`;
    }

    if (severity) {
      return {
        id: `wind-${stationId}-${Date.now()}`,
        type: 'wind',
        severity,
        title,
        message,
        threshold: severity === 'critical' ? critical : severity === 'high' ? high : medium,
        currentValue: windSpeed,
        stationId,
        stationName,
        timestamp: Date.now()
      };
    }

    return null;
  }

  private checkTemperature(temperature: number, stationId: string, stationName: string): WeatherAlert | null {
    const { low, high, critical } = this.thresholds.temperature;
    let severity: 'medium' | 'high' | 'critical' | null = null;
    let title = '';
    let message = '';

    if (temperature >= critical) {
      severity = 'critical';
      title = '🔥 CRITICAL Temperature Alert';
      message = `Extreme temperature at ${stationName}: ${temperature}°C. Heat stroke risk is high.`;
    } else if (temperature >= high) {
      severity = 'high';
      title = '🌡️ HIGH Temperature Alert';
      message = `Very high temperature at ${stationName}: ${temperature}°C. Stay cool and hydrated.`;
    } else if (temperature <= low) {
      severity = 'medium';
      title = '🧊 Low Temperature Advisory';
      message = `Cold weather at ${stationName}: ${temperature}°C. Dress warmly.`;
    }

    if (severity) {
      return {
        id: `temp-${stationId}-${Date.now()}`,
        type: 'temperature',
        severity,
        title,
        message,
        threshold: temperature <= low ? low : severity === 'critical' ? critical : high,
        currentValue: temperature,
        stationId,
        stationName,
        timestamp: Date.now()
      };
    }

    return null;
  }

  private async processAlert(alert: WeatherAlert) {
    const alertKey = `${alert.type}-${alert.stationId}`;
    const existingAlert = this.activeAlerts.get(alertKey);

    // Check if this is a new alert or severity has increased
    const shouldSendNotification = !existingAlert || 
      this.getSeverityLevel(alert.severity) > this.getSeverityLevel(existingAlert.severity);

    if (shouldSendNotification) {
      // Update active alerts
      this.activeAlerts.set(alertKey, alert);
      
      // Add to history
      this.alertHistory.unshift(alert);
      
      // Keep only last 50 alerts in history
      if (this.alertHistory.length > 50) {
        this.alertHistory = this.alertHistory.slice(0, 50);
      }

      // Send push notification if FCM is available
      try {
        await fcmService.showLocalNotification({
          title: alert.title,
          body: alert.message,
          icon: '/images/logo.png',
          data: {
            alertId: alert.id,
            stationId: alert.stationId,
            type: alert.type,
            severity: alert.severity
          }
        });
      } catch (error) {
        console.error('Failed to send weather alert notification:', error);
      }

      // Store in localStorage
      this.saveAlertsToStorage();

      console.log('Weather Alert:', alert);
    }
  }

  private getSeverityLevel(severity: string): number {
    switch (severity) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      case 'critical': return 4;
      default: return 0;
    }
  }

  private saveAlertsToStorage() {
    try {
      localStorage.setItem('weather_alerts_active', JSON.stringify(Array.from(this.activeAlerts.entries())));
      localStorage.setItem('weather_alerts_history', JSON.stringify(this.alertHistory.slice(0, 10)));
    } catch (error) {
      console.error('Failed to save alerts to storage:', error);
    }
  }

  private loadAlertsFromStorage() {
    try {
      const activeAlertsData = localStorage.getItem('weather_alerts_active');
      const historyData = localStorage.getItem('weather_alerts_history');
      
      if (activeAlertsData) {
        const entries = JSON.parse(activeAlertsData);
        this.activeAlerts = new Map(entries);
      }
      
      if (historyData) {
        this.alertHistory = JSON.parse(historyData);
      }
    } catch (error) {
      console.error('Failed to load alerts from storage:', error);
    }
  }

  // Public methods
  getActiveAlerts(): WeatherAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  getAlertHistory(): WeatherAlert[] {
    return this.alertHistory;
  }

  clearAlert(alertType: string, stationId: string) {
    const key = `${alertType}-${stationId}`;
    this.activeAlerts.delete(key);
    this.saveAlertsToStorage();
  }

  clearAllAlerts() {
    this.activeAlerts.clear();
    this.saveAlertsToStorage();
  }

  // Initialize the system
  initialize() {
    this.loadAlertsFromStorage();
    console.log('Weather Alert System initialized');
  }
}

export const weatherAlertSystem = new WeatherAlertSystem();
