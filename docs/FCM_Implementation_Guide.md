# Firebase Cloud Messaging (FCM) Implementation Guide

This document explains how Firebase Cloud Messaging has been implemented in the Moses Weather Station app.

## Overview

Firebase Cloud Messaging (FCM) has been integrated to provide real-time weather alerts and notifications to users. The implementation includes:

- Automatic weather condition monitoring
- Push notifications for critical weather events
- User-configurable notification settings
- Background message handling

## Features

### 1. Automatic Weather Alerts

The system monitors the following conditions and sends alerts when thresholds are exceeded:

**Heat Index Alerts:**
- Medium (35°C+): Heat Advisory - Stay hydrated
- High (38°C+): Heat Alert - Limit outdoor activities  
- Critical (42°C+): Dangerous conditions - Seek immediate shelter

**Rainfall Alerts:**
- Medium (50mm+): Rainfall Advisory - Use caution when traveling
- High (100mm+): High Rainfall Alert - Monitor flood conditions
- Critical (200mm+): Flood Warning - Avoid travel

**Wind Speed Alerts:**
- Medium (10 m/s+): Wind Advisory - Monitor conditions
- High (15 m/s+): Strong winds - Use caution outdoors
- Critical (20 m/s+): Dangerous wind speeds - Avoid outdoor activities

**Temperature Alerts:**
- Low (15°C or below): Cold weather advisory
- High (40°C+): Very high temperature alert
- Critical (45°C+): Extreme temperature alert

### 2. Notification Settings

Users can configure their notification preferences through the navigation panel:

- Weather Alerts (severe weather warnings)
- Rain Alerts (heavy rainfall notifications)
- Temperature Alerts (extreme temperature warnings)
- Daily Updates (daily weather summary)

### 3. FCM Token Management

Your VAPID key is: `BE13Ms9_hEAffOb2G7LPZEOw45o3twSi16n6jXiqHhS8470hj5tpMW284UYDF2cMPnNFj_a0zW7b8yIJYb8Gf28`

The system automatically:
- Requests notification permissions
- Generates and stores FCM tokens
- Registers service worker for background notifications

## Files Created/Modified

### New Files:
1. **`/public/firebase-messaging-sw.js`** - Service worker for background notifications
2. **`/public/manifest.json`** - PWA manifest for proper notification support
3. **`/src/utils/fcm.ts`** - FCM service and utilities
4. **`/src/utils/useFCM.ts`** - Vue composable for FCM integration
5. **`/src/utils/weatherAlerts.ts`** - Weather alert monitoring system
6. **`/src/components/NotificationSettings.vue`** - User notification preferences UI

### Modified Files:
1. **`/src/firebase.ts`** - Added FCM imports and VAPID key
2. **`/src/main.ts`** - Added service worker registration
3. **`/src/views/HomePage.vue`** - Integrated FCM and weather alerts
4. **`/index.html`** - Added manifest.json reference

## Usage Instructions

### For Development:
1. The FCM system is automatically initialized when the app loads
2. In browser developer tools, check the Console for FCM initialization messages
3. The notification settings panel is available in the navigation sidebar
4. Test notifications can be triggered from the settings panel

### For Production:
1. Enable notification permissions when prompted
2. The system will automatically monitor weather conditions
3. Users will receive push notifications for critical weather events
4. Notifications work even when the app is in the background

## Browser Compatibility

- **Supported:** Chrome, Firefox, Safari (iOS 16.4+), Edge
- **Not Supported:** Native mobile apps (use Capacitor Push Notifications instead)
- **Requirements:** HTTPS (works on localhost for development)

## Testing

### Test Notification:
1. Open the app in a modern browser
2. Allow notification permissions when prompted  
3. Open the navigation panel (📍 button)
4. Click "Test Notification" in the notification settings
5. A test notification should appear

### Test Weather Alerts:
The system automatically monitors current weather conditions and will send alerts when thresholds are exceeded based on real sensor data from the weather stations.

## Backend Integration

To send notifications from your server:

```javascript
// Example server-side notification
const admin = require('firebase-admin');

// Send to specific token
await admin.messaging().send({
  token: userFCMToken,
  notification: {
    title: '🌧️ Heavy Rainfall Alert',
    body: 'Heavy rainfall detected at MinSU Station: 120mm. Monitor flood conditions.'
  },
  data: {
    stationId: 'station1',
    alertType: 'rainfall',
    severity: 'high'
  }
});
```

## Troubleshooting

**Notifications not working:**
1. Check if notifications are enabled in browser settings
2. Ensure the app is running on HTTPS (or localhost)
3. Check browser console for FCM errors
4. Verify the service worker is registered properly

**VAPID Key Issues:**
- The VAPID key is already configured in the code
- No additional setup needed for basic functionality
- For production, consider storing the key in environment variables

## Security Notes

- FCM tokens are stored locally and can be sent to your backend
- The VAPID key is public and safe to include in client-side code
- Service worker handles message security automatically
- User consent is required before enabling notifications

---

**Your FCM implementation is now ready!** The system will automatically monitor weather conditions and send appropriate alerts to users who have enabled notifications.
