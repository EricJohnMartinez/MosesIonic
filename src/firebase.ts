// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// const firebaseConfig = {
//   apiKey: 'AIzaSyBo6-vuNMwKGoDHC7LALDB1tWlQJ9AdGZk',
//   authDomain: 'weather-station-c541d.firebaseapp.com',
//   databaseURL: 'https://weather-station-c541d-default-rtdb.firebaseio.com',
//   projectId: 'weather-station-c541d',
//   storageBucket: 'weather-station-c541d.appspot.com',
//   messagingSenderId: '885584398219',
//   appId: '1:885584398219:web:a5a482270c256430fc518e',
// };

const firebaseConfig = {
  apiKey: "AIzaSyD41XvnWoVwqobpPNA8Fw1L6D8hB71OAO4",
  authDomain: "project-genesis-2025.firebaseapp.com",
  databaseURL: "https://project-genesis-2025-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "project-genesis-2025",
  storageBucket: "project-genesis-2025.firebasestorage.app",
  messagingSenderId: "839395634291",
  appId: "1:839395634291:web:4283a14279f95eea6f4e06",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Realtime Database
export const db = getDatabase(app);

// VAPID key for push notifications
export const VAPID_KEY = 'BL4KWajnr7X8u1kPqpalFa5dZJmkelbqWrbmZ4O0kj0i9IusqQ9ZrOteXpWc9Z2Hl7XOpv1U7gy2q4XoLtGNCOE';

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
