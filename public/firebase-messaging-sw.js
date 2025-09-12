// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyBo6-vuNMwKGoDHC7LALDB1tWlQJ9AdGZk',
  authDomain: 'weather-station-c541d.firebaseapp.com',
  databaseURL: 'https://weather-station-c541d-default-rtdb.firebaseio.com',
  projectId: 'weather-station-c541d',
  storageBucket: 'weather-station-c541d.appspot.com',
  messagingSenderId: '885584398219',
  appId: '1:885584398219:web:a5a482270c256430fc518e',
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Weather Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new weather update',
    icon: '/images/logo.png',
    badge: '/images/logo.png',
    tag: 'weather-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open') {
    // Open the app or focus existing window
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});
