// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyBo6-vuNMwKGoDHC7LALDB1tWlQJ9AdGZk',
  authDomain: 'weather-station-c541d.firebaseapp.com',
  databaseURL: 'https://weather-station-c541d-default-rtdb.firebaseio.com',
  projectId: 'weather-station-c541d',
  storageBucket: 'weather-station-c541d.appspot.com',
  messagingSenderId: '885584398219',
  appId: '1:885584398219:web:a5a482270c256430fc518e',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Realtime Database
export const db = getDatabase(app);

// VAPID key for push notifications
export const VAPID_KEY = 'BE13Ms9_hEAffOb2G7LPZEOw45o3twSi16n6jXiqHhS8470hj5tpMW284UYDF2cMPnNFj_a0zW7b8yIJYb8Gf28';

// Conditionally initialize Firebase Messaging only when needed and supported
let messaging: any = null;

export const initializeMessaging = async (): Promise<any> => {
  if (messaging) {
    return messaging; // Already initialized
  }

  try {
    // Check if we're in a supported environment
    if (typeof window === 'undefined' || 
        !('serviceWorker' in navigator) || 
        !('Notification' in window) || 
        !('PushManager' in window)) {
      console.log('🔒 Firebase Messaging not supported in this environment');
      return null;
    }

    // Dynamic import to avoid errors on unsupported browsers
    const { getMessaging } = await import('firebase/messaging');
    messaging = getMessaging(app);
    console.log('✅ Firebase Messaging initialized successfully');
    return messaging;
  } catch (error) {
    console.log('🔒 Firebase Messaging initialization failed:', error);
    return null;
  }
};

export { messaging };
