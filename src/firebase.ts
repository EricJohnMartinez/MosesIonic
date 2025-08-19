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
