// 1. Download your google-services.json from Firebase Console (Project Settings > Android app) and place it in android/app/
// 2. The following code demonstrates how to use the Capacitor FCM plugin for Android in your Ionic app.


import { registerPlugin } from '@capacitor/core';
import { onMounted } from 'vue';

const FirebaseMessaging = registerPlugin<{
  requestPermissions: () => Promise<{ receive: string }>;
  getToken: () => Promise<{ token: string }>;
  addListener: (eventName: string, callback: (data: any) => void) => void;
}>('FirebaseMessaging');

export function useNativeFCM() {
  // Request permission and get FCM token
  const getToken = async () => {
    try {
      const permission = await FirebaseMessaging.requestPermissions();
      if (permission.receive === 'granted') {
        const { token } = await FirebaseMessaging.getToken();
        console.log('FCM Token (Android):', token);
        // Send this token to your backend if needed
        return token;
      } else {
        console.warn('FCM permission not granted');
        return null;
      }
    } catch (err) {
      console.error('Error getting FCM token:', err);
      return null;
    }
  };

  // Listen for foreground messages
  const addListener = () => {
    FirebaseMessaging.addListener('notificationReceived', (data) => {
      console.log('Push notification received (Android):', data);
      // Show toast, alert, or update UI as needed
    });
  };


  onMounted(() => {
    getToken();
    addListener();
  });

  return { getToken };
}
