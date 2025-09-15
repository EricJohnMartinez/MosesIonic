// TypeScript declaration for Cordova plugin usage
declare global {
  interface Window {
    cordova: any;
  }
}
// 1. Download your google-services.json from Firebase Console (Project Settings > Android app) and place it in android/app/
// 2. The following code demonstrates how to use the Capacitor FCM plugin for Android in your Ionic app.


import { registerPlugin } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { onMounted } from 'vue';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref as dbRef, set } from 'firebase/database';

// Your Firebase config for the database where you want to store the token
const firebaseConfig = {
  apiKey: "AIzaSyD41XvnWoVwqobpPNA8Fw1L6D8hB71OAO4",
  authDomain: "project-genesis-2025.firebaseapp.com",
  databaseURL: "https://project-genesis-2025-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "project-genesis-2025",
  storageBucket: "project-genesis-2025.firebasestorage.app",
  messagingSenderId: "839395634291",
  appId: "1:839395634291:web:4283a14279f95eea6f4e06",
  measurementId: "G-08HBZB2PXL"
};
const firebaseApp = initializeApp(firebaseConfig, 'token-saver');
const db = getDatabase(firebaseApp);

const FirebaseMessaging = registerPlugin<{
  requestPermissions: () => Promise<{ receive: string }>;
  getToken: () => Promise<{ token: string }>;
  addListener: (eventName: string, callback: (data: any) => void) => void;
}>('FirebaseMessaging');

export function useNativeFCM() {
  // Request permission and get FCM token
  // Generate or get a unique device ID (per install)

  // Get Android ID using @capacitor/device
  async function getDeviceId() {
    try {
      const info = await Device.getId();
      if (info.identifier) {
        localStorage.setItem('device_id', info.identifier);
        return info.identifier;
      }
    } catch (e) {
      // fallback to random if error
      let id = localStorage.getItem('device_id');
      if (!id) {
        id = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('device_id', id);
      }
      return id;
    }
  }

  const getToken = async () => {
    try {
      const permission = await FirebaseMessaging.requestPermissions();
      if (permission.receive === 'granted') {
        const { token } = await FirebaseMessaging.getToken();
        console.log('FCM Token (Android):', token);
        // Save the token to Firebase Realtime Database under tokens/android/<mac or fallback>
        const deviceId = await getDeviceId();
        set(dbRef(db, `tokens/android/${deviceId}`), token)
          .then(() => {
            console.log('Android token saved to Firebase under device ID!');
          })
          .catch((error) => {
            console.error('Error saving token:', error);
          });
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
