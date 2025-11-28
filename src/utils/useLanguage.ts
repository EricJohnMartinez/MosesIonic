import { ref, computed } from 'vue';
import { Preferences } from '@capacitor/preferences';

export type Language = 'en' | 'tl';

const currentLanguage = ref<Language>('en');

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header & Navigation
    'weather_index': 'Weather Index',
    'heat_index': 'Heat Index',
    'feels_like': 'Feels like',
    'water_level': 'Water Level Monitoring',
    
    // Weather Metrics
    'temperature': 'Temperature',
    'humidity': 'Humidity',
    'wind_speed': 'Wind Speed',
    'wind_direction': 'Wind Direction',
    'precipitation': 'Precipitation',
    'rain_rate': 'Rain Rate',
    'air_pressure': 'Air Pressure',
    'solar': 'Solar',
    'soil_moisture': 'Soil Moisture',
    'soil_temp': 'Soil Temp',
    'light_intensity': 'Light Intensity',
    
    // Rainfall
    'rainfall_intensity': 'Rainfall Intensity & Warnings',
    'current_intensity': 'Current Intensity',
    'daily_total': 'Daily Total',
    'category': 'Category',
    'warning_levels': 'Warning Levels',
    
    // Heat Index Warnings
    'low_risk': 'LOW RISK',
    'caution': 'CAUTION',
    'extreme': 'EXTREME',
    'extreme_caution': 'EXTREME CAUTION',
    'danger': 'DANGER',
    'extreme_danger': 'EXTREME DANGER',
    
    // Heat Index Messages
    'low_risk_msg': 'Perfect weather for outdoor activities',
    'caution_msg': 'Fatigue is possible with prolonged exposure and activity',
    'extreme_caution_msg': 'Heat cramps and heat exhaustion are possible',
    'danger_msg': 'Heat cramps and heat exhaustion are likely',
    'extreme_danger_msg': 'Heat stroke is imminent',
    
    // Rainfall Categories
    'no_rain': 'No Rain',
    'light_rain': 'Light Rain',
    'moderate_rain': 'Moderate Rain',
    'heavy_rain': 'Heavy Rain',
    'intense_rain': 'Intense Rain',
    'torrential_rain': 'Torrential Rain',
    
    // Weather Conditions
    'sunny': 'Sunny',
    'cloudy': 'Cloudy',
    'rainy': 'Rainy',
    'partly_cloudy': 'Partly Cloudy',
    'unknown': 'Unknown',
    
    // Actions & UI
    'heat_alert_active': 'Heat Alert Active',
    'view_more_data': 'View more data',
    'language': 'Language',
    'english': 'English',
    'tagalog': 'Tagalog',
    'settings': 'Settings',
    'refresh': 'Refresh',
    'last_updated': 'Last updated',
    
    // Station
    'station': 'Station',
    'select_station': 'Select Station',
  },
  tl: {
    // Header & Navigation
    'weather_index': 'Indeks ng Panahon',
    'heat_index': 'Indeks ng Init',
    'feels_like': 'Pakiramdam',
    'water_level': 'Pagsubaybay sa Antas ng Tubig',
    
    // Weather Metrics
    'temperature': 'Temperatura',
    'humidity': 'Halumigmig',
    'wind_speed': 'Bilis ng Hangin',
    'wind_direction': 'Direksyon ng Hangin',
    'precipitation': 'Pag-ulan',
    'rain_rate': 'Lakas ng Ulan',
    'air_pressure': 'Presyon ng Hangin',
    'solar': 'Solar',
    'soil_moisture': 'Halumigmig ng Lupa',
    'soil_temp': 'Temp ng Lupa',
    'light_intensity': 'Lakas ng Liwanag',
    
    // Rainfall
    'rainfall_intensity': 'Lakas ng Ulan at Babala',
    'current_intensity': 'Kasalukuyang Lakas',
    'daily_total': 'Kabuuang Araw',
    'category': 'Kategorya',
    'warning_levels': 'Antas ng Babala',
    
    // Heat Index Warnings
    'low_risk': 'MABABANG PANGANIB',
    'caution': 'MAG-INGAT',
    'extreme': 'LABIS',
    'extreme_caution': 'LABIS NA PAG-IINGAT',
    'danger': 'MAPANGANIB',
    'extreme_danger': 'LUBHANG MAPANGANIB',
    
    // Heat Index Messages
    'low_risk_msg': 'Perpektong panahon para sa mga aktibidad sa labas',
    'caution_msg': 'Posibleng mapagod sa matagal na pagkakalantad at aktibidad',
    'extreme_caution_msg': 'Posibleng magkaroon ng pulikat at heat exhaustion',
    'danger_msg': 'Malamang na magkaroon ng pulikat at heat exhaustion',
    'extreme_danger_msg': 'Napipintong heat stroke',
    
    // Rainfall Categories
    'no_rain': 'Walang Ulan',
    'light_rain': 'Magaan na Ulan',
    'moderate_rain': 'Katamtamang Ulan',
    'heavy_rain': 'Malakas na Ulan',
    'intense_rain': 'Matinding Ulan',
    'torrential_rain': 'Malakas na Buhos',
    
    // Weather Conditions
    'sunny': 'Maaraw',
    'cloudy': 'Maulap',
    'rainy': 'Maulan',
    'partly_cloudy': 'Bahagyang Maulap',
    'unknown': 'Hindi Alam',
    
    // Actions & UI
    'heat_alert_active': 'Aktibong Babala sa Init',
    'view_more_data': 'Tingnan ang higit pang datos',
    'language': 'Wika',
    'english': 'Ingles',
    'tagalog': 'Tagalog',
    'settings': 'Mga Setting',
    'refresh': 'I-refresh',
    'last_updated': 'Huling na-update',
    
    // Station
    'station': 'Istasyon',
    'select_station': 'Pumili ng Istasyon',
  }
};

export function useLanguage() {
  const t = (key: string): string => {
    return translations[currentLanguage.value][key] || translations['en'][key] || key;
  };

  const setLanguage = async (lang: Language) => {
    currentLanguage.value = lang;
    try {
      await Preferences.set({ key: 'language', value: lang });
    } catch (e) {
      console.warn('Failed to save language preference', e);
    }
  };

  const loadLanguage = async () => {
    try {
      const { value } = await Preferences.get({ key: 'language' });
      if (value === 'en' || value === 'tl') {
        currentLanguage.value = value;
      }
    } catch (e) {
      // ignore and keep default
    }
  };

  const toggleLanguage = async () => {
    const newLang = currentLanguage.value === 'en' ? 'tl' : 'en';
    await setLanguage(newLang);
  };

  const language = computed(() => currentLanguage.value);
  const isEnglish = computed(() => currentLanguage.value === 'en');
  const isTagalog = computed(() => currentLanguage.value === 'tl');

  return {
    t,
    language,
    isEnglish,
    isTagalog,
    setLanguage,
    loadLanguage,
    toggleLanguage
  };
}
