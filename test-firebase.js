import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyBo6-vuNMwKGoDHC7LALDB1tWlQJ9AdGZk',
  authDomain: 'weather-station-c541d.firebaseapp.com',
  databaseURL: 'https://weather-station-c541d-default-rtdb.firebaseio.com',
  projectId: 'weather-station-c541d',
  storageBucket: 'weather-station-c541d.appspot.com',
  messagingSenderId: '885584398219',
  appId: '1:885584398219:web:a5a482270c256430fc518e',
};

console.log('🔄 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
console.log('✅ Firebase initialized');

async function testBasicConnection() {
  try {
    console.log('🔍 Testing basic Firebase connection...');

    // Test with a simple path that should exist
    const testRef = ref(db, 'station1');
    console.log('📡 Attempting to fetch station1...');

    const snapshot = await get(testRef);

    if (snapshot.exists()) {
      console.log('✅ Station1 data found!');
      const data = snapshot.val();
      console.log('📊 Data keys:', Object.keys(data || {}));

      // Check if it has the expected structure
      if (data && typeof data === 'object') {
        if (data.data && data.data.sensors) {
          console.log('✅ Data structure looks correct');
          console.log('� Sensors found:', Object.keys(data.data.sensors));
        } else {
          console.log('⚠️  Data structure might be different');
          console.log('Available keys in data:', Object.keys(data));
        }
      }
    } else {
      console.log('❌ No data found at station1');
    }

  } catch (error) {
    console.error('❌ Firebase test failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testBasicConnection();