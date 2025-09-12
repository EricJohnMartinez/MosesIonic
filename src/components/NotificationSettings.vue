<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>
        <ion-icon :icon="notificationsOutline" class="mr-2"></ion-icon>
        Push Notifications
      </ion-card-title>
      <ion-card-subtitle>Weather alerts and updates</ion-card-subtitle>
    </ion-card-header>

    <ion-card-content>
      <div v-if="!isSupported" class="text-center p-4">
        <ion-icon :icon="warningOutline" color="warning" size="large"></ion-icon>
        <p class="mt-2 text-gray-600">
          Push notifications are not supported on this device
        </p>
      </div>

      <div v-else>
        <div v-if="!token" class="space-y-4">
          <div class="text-center">
            <ion-icon :icon="notificationsOffOutline" color="medium" size="large"></ion-icon>
            <p class="mt-2 text-gray-600">
              Enable push notifications to receive weather alerts
            </p>
          </div>
          
          <!-- Debug Info -->
          <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Supported: {{ isSupported ? 'Yes' : 'No' }}</p>
            <p>Loading: {{ isLoading ? 'Yes' : 'No' }}</p>
            <p>Error: {{ error || 'None' }}</p>
            <p>Notification Permission: {{ notificationPermission }}</p>
          </div>
          
          <ion-button 
            expand="block" 
            @click="enableNotifications"
            :disabled="isLoading"
          >
            <ion-spinner v-if="isLoading" name="crescent" class="mr-2"></ion-spinner>
            <ion-icon v-else :icon="notificationsOutline" class="mr-2"></ion-icon>
            {{ isLoading ? 'Enabling...' : 'Enable Notifications' }}
          </ion-button>

          <!-- Manual permission request if denied -->
          <ion-button 
            v-if="notificationPermission === 'denied'"
            expand="block" 
            fill="outline"
            color="warning"
            @click="showPermissionHelp"
          >
            <ion-icon :icon="warningOutline" class="mr-2"></ion-icon>
            Permission Denied - Help
          </ion-button>
        </div>

        <div v-else class="space-y-4">
          <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div class="flex items-center">
              <ion-icon :icon="checkmarkCircle" color="success" class="mr-2"></ion-icon>
              <span class="text-sm font-medium text-green-800">Notifications Enabled</span>
            </div>
          </div>

          <!-- FCM Token Display - Prominent -->
          <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 class="font-bold text-blue-800 mb-2 flex items-center">
              🔑 Your FCM Token
            </h4>
            <div class="bg-white p-3 rounded border text-xs font-mono break-all text-gray-700 mb-3">
              {{ token || 'Token not available' }}
            </div>
            <div class="flex gap-2">
              <button 
                @click="copyToken" 
                class="px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
              >
                📋 Copy Token
              </button>
              <button 
                @click="refreshToken" 
                class="px-3 py-2 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <h4 class="font-medium text-gray-700">Notification Settings</h4>
            
            <ion-item>
              <ion-checkbox 
                v-model="settings.weatherAlerts" 
                @ionChange="updateSettings"
              ></ion-checkbox>
              <ion-label class="ml-3">
                <h3>Weather Alerts</h3>
                <p>Severe weather warnings</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-checkbox 
                v-model="settings.rainAlerts" 
                @ionChange="updateSettings"
              ></ion-checkbox>
              <ion-label class="ml-3">
                <h3>Rain Alerts</h3>
                <p>Heavy rainfall notifications</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-checkbox 
                v-model="settings.temperatureAlerts" 
                @ionChange="updateSettings"
              ></ion-checkbox>
              <ion-label class="ml-3">
                <h3>Temperature Alerts</h3>
                <p>Extreme temperature warnings</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-checkbox 
                v-model="settings.dailyUpdates" 
                @ionChange="updateSettings"
              ></ion-checkbox>
              <ion-label class="ml-3">
                <h3>Daily Updates</h3>
                <p>Daily weather summary</p>
              </ion-label>
            </ion-item>
          </div>

          <div class="space-y-2 pt-4">
            <ion-button 
              fill="outline" 
              expand="block" 
              @click="testNotification"
              size="small"
            >
              <ion-icon :icon="bulbOutline" class="mr-2"></ion-icon>
              Test Notification
            </ion-button>


          </div>
        </div>

        <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-center">
            <ion-icon :icon="alertCircleOutline" color="danger" class="mr-2"></ion-icon>
            <span class="text-sm text-red-800">{{ error }}</span>
          </div>
        </div>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonButton,
  IonIcon,
  IonSpinner,
  IonItem,
  IonLabel,
  IonCheckbox
} from '@ionic/vue';
import {
  notificationsOutline,
  notificationsOffOutline,
  warningOutline,
  checkmarkCircle,
  bulbOutline,
  alertCircleOutline
} from 'ionicons/icons';
import { useFCM } from '../utils/useFCM';

const {
  isSupported,
  token,
  isLoading,
  error,
  requestPermission,
  testNotification
} = useFCM();

const settings = ref({
  weatherAlerts: true,
  rainAlerts: true,
  temperatureAlerts: true,
  dailyUpdates: false
});

const enableNotifications = async () => {
  await requestPermission();
};

const copyToken = async () => {
  if (token.value) {
    try {
      await navigator.clipboard.writeText(token.value);
      // Show toast notification
      const toast = document.createElement('div');
      toast.textContent = 'Token copied to clipboard!';
      toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:8px;z-index:10000;font-size:14px;';
      document.body.appendChild(toast);
      setTimeout(() => document.body.removeChild(toast), 2000);
    } catch (error) {
      console.error('Failed to copy token:', error);
    }
  }
};

const refreshToken = async () => {
  await requestPermission();
};

const notificationPermission = computed(() => {
  return typeof window !== 'undefined' && 'Notification' in window 
    ? window.Notification.permission 
    : 'unknown';
});

const showPermissionHelp = () => {
  alert('Notifications were denied. To enable:\n\n1. Click the lock icon in your browser address bar\n2. Set Notifications to "Allow"\n3. Refresh this page\n4. Try enabling notifications again');
};

const updateSettings = () => {
  // Save settings to localStorage
  localStorage.setItem('notification_settings', JSON.stringify(settings.value));
  console.log('Notification settings updated:', settings.value);
};

onMounted(() => {
  // Load saved settings
  const savedSettings = localStorage.getItem('notification_settings');
  if (savedSettings) {
    settings.value = { ...settings.value, ...JSON.parse(savedSettings) };
  }

  // Check for existing FCM token in localStorage
  const existingToken = localStorage.getItem('fcm_token') || localStorage.getItem('fcm_debug_token');
  if (existingToken && !token.value) {
    console.log('🔍 Found existing FCM token in localStorage');
    // Update the token ref if we found one stored locally
    // Note: The actual token ref comes from useFCM, but we can trigger a refresh
    if (typeof refreshToken === 'function') {
      refreshToken();
    }
  }
});
</script>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-2 > * + * {
  margin-top: 0.5rem;
}
</style>
