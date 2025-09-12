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
        <p class="mt-2 text-gray-600 font-medium">
          Push notifications are not supported on this device
        </p>
        
        <!-- Detailed browser compatibility info -->
        <div class="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-left text-sm">
          <p class="text-orange-800 font-medium mb-2">📱 Browser Requirements:</p>
          <div class="space-y-1 text-orange-700">
            <p>• Service Workers: {{ hasServiceWorker ? '✅' : '❌' }}</p>
            <p>• Notifications API: {{ hasNotifications ? '✅' : '❌' }}</p>
            <p>• Push Manager: {{ hasPushManager ? '✅' : '❌' }}</p>
          </div>
          
          <div class="mt-3 pt-3 border-t border-orange-200">
            <p class="text-orange-800 font-medium mb-1">✅ Supported Browsers:</p>
            <p class="text-xs text-orange-600">Chrome Mobile, Firefox Mobile, Safari Mobile (11.1+), Samsung Internet</p>
            
            <p class="text-orange-800 font-medium mb-1 mt-2">❌ Not Supported:</p>
            <p class="text-xs text-orange-600">Opera Mini, UC Browser, older browsers</p>
          </div>
          
          <div class="mt-3 pt-3 border-t border-orange-200">
            <p class="text-orange-800 font-medium mb-1">💡 Try:</p>
            <p class="text-xs text-orange-600">Open this app in Chrome Mobile or another supported browser</p>
          </div>
        </div>
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
          <div v-if="notificationPermission === 'denied'" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center mb-2">
              <ion-icon :icon="warningOutline" color="danger" class="mr-2"></ion-icon>
              <span class="text-red-800 font-medium">Notifications Blocked</span>
            </div>
            <p class="text-red-700 text-sm mb-3">
              You previously denied notification permissions. To enable notifications:
            </p>
            <div class="text-sm text-red-600 space-y-1 mb-3">
              <p><strong>Chrome Mobile:</strong></p>
              <p>• Tap the lock icon 🔒 in the address bar</p>
              <p>• Set "Notifications" to "Allow"</p>
              <p>• Refresh this page</p>
              
              <p class="mt-2"><strong>Safari Mobile:</strong></p>
              <p>• Go to iPhone Settings → Safari → Website Settings</p>
              <p>• Find this site and enable notifications</p>
            </div>
            <ion-button 
              size="small"
              fill="outline"
              color="danger"
              @click="showPermissionHelp"
            >
              <ion-icon :icon="warningOutline" class="mr-2"></ion-icon>
              Detailed Help
            </ion-button>
          </div>
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

// Browser feature detection for detailed feedback
const hasServiceWorker = computed(() => {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
});

const hasNotifications = computed(() => {
  return typeof window !== 'undefined' && 'Notification' in window;
});

const hasPushManager = computed(() => {
  return typeof window !== 'undefined' && 'PushManager' in window;
});

const showPermissionHelp = () => {
  const helpText = `📱 ENABLE NOTIFICATIONS HELP

🔧 CHROME MOBILE:
1. Tap the lock icon 🔒 in address bar
2. Tap "Permissions"
3. Set "Notifications" to "Allow"
4. Refresh this page

🔧 FIREFOX MOBILE:
1. Tap menu (⋮) → Settings
2. Tap "Site Settings"
3. Find this website
4. Enable "Notifications"

🔧 SAFARI MOBILE (iOS):
1. Open iPhone Settings
2. Go to Safari → Website Settings
3. Find this website
4. Enable "Notifications"

🔧 ALTERNATIVE METHOD:
1. Clear this website's data in browser settings
2. Visit the site again
3. Accept notification permission when prompted

Still having issues? Try opening this app in Chrome Mobile for best compatibility.`;

  alert(helpText);
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
