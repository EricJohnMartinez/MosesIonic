// src/utils/useFCM.ts
import { ref, onMounted, onUnmounted } from 'vue';
import { fcmService, NotificationPayload } from './fcm';
import { alertController, toastController } from '@ionic/vue';

export function useFCM() {
  const isSupported = ref(false);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const lastMessage = ref<any>(null);

  // Check for existing token immediately
  const existingToken = localStorage.getItem('fcm_token') || localStorage.getItem('fcm_debug_token');
  if (existingToken) {
    token.value = existingToken;
    console.log('🔍 Loaded existing FCM token from storage');
  }

  const initializeFCM = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      isSupported.value = fcmService.isNotificationSupported();
      
      console.log('FCM Support Check:', {
        isSupported: isSupported.value,
        hasServiceWorker: 'serviceWorker' in navigator,
        hasNotification: 'Notification' in window,
        notificationPermission: 'Notification' in window ? Notification.permission : 'N/A'
      });
      
      if (!isSupported.value) {
        console.log('FCM not supported on this platform');
        error.value = 'FCM not supported on this platform or browser';
        return;
      }

      // Automatically request permissions and get token
      console.log('🚀 Auto-initializing FCM with automatic permission request...');
      const fcmToken = await fcmService.getTokenAutomatically();
      console.log('FCM Token received:', fcmToken ? 'Yes' : 'No');
      
      token.value = fcmToken;

      if (fcmToken) {
        console.log('✅ FCM initialized successfully with token');
        
        // Store token locally for debugging and display
        localStorage.setItem('fcm_debug_token', fcmToken);
        localStorage.setItem('fcm_token_timestamp', Date.now().toString());
        
        // You can send this token to your backend server
        // to store it for sending push notifications
        await sendTokenToServer(fcmToken);
        
        // Show success message
        // showToast('🔔 Push notifications ready!', 'success');
      } else {
        error.value = 'FCM token not available - notifications may be disabled';
        console.log('ℹ️ FCM token not available, but continuing app functionality');
        // Don't show error toast for this case - it's normal if user doesn't want notifications
      }

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('FCM initialization error:', err);
      // Only show error if it's a critical failure, not permission denial
      if (!err?.toString().includes('permission')) {
        showToast('FCM setup encountered an issue', 'warning');
      }
    } finally {
      isLoading.value = false;
    }
  };

  const setupForegroundListener = () => {
    fcmService.onForegroundMessage(async (payload) => {
      lastMessage.value = payload;
      console.log('Foreground message received:', payload);

      // Show alert for foreground messages
      await showNotificationAlert(payload);
    });
  };

  const showNotificationAlert = async (payload: any) => {
    const alert = await alertController.create({
      header: payload.notification?.title || 'Weather Alert',
      message: payload.notification?.body || 'You have a new weather update',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        },
        {
          text: 'View',
          handler: () => {
            // Handle notification action
            console.log('User wants to view the alert');
            // You can navigate to specific page or show more details
          }
        }
      ]
    });

    await alert.present();
  };

  const showToast = async (message: string, color: 'success' | 'warning' | 'danger' = 'success') => {
    const toast = await toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  };

  const sendTokenToServer = async (token: string) => {
    try {
      // Here you would send the token to your backend server
      // Example:
      // const response = await fetch('/api/fcm-token', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, userId: currentUser.id })
      // });
      
      console.log('Token should be sent to server:', token);
      
      // Store token in localStorage for now
      localStorage.setItem('fcm_token', token);
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  };

  const requestPermission = async () => {
    const hasPermission = await fcmService.requestPermission();
    if (hasPermission) {
      await initializeFCM();
    } else {
      showToast('Permission denied for notifications', 'warning');
    }
  };

  const showLocalNotification = async (payload: NotificationPayload) => {
    await fcmService.showLocalNotification(payload);
  };

  // Test notification function
  const testNotification = async () => {
    await showLocalNotification({
      title: 'Test Weather Alert',
      body: 'This is a test notification from Moses Weather App',
      icon: '/images/logo.png'
    });
  };

  onMounted(async () => {
    setupForegroundListener();
    
    // Auto-initialize FCM when component mounts
    console.log('🔄 Auto-initializing FCM on component mount...');
    await initializeFCM();
  });

  return {
    isSupported: isSupported.value,
    token,
    isLoading,
    error,
    lastMessage,
    initializeFCM,
    requestPermission,
    showLocalNotification,
    testNotification
  };
}
