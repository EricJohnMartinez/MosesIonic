// src/utils/fcm.ts
import { getToken, onMessage, Messaging } from 'firebase/messaging';
import { messaging, VAPID_KEY } from '../firebase';
import { isPlatform } from '@ionic/vue';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  data?: any;
}

class FCMService {
  private isSupported = false;
  private token: string | null = null;

  constructor() {
    this.isSupported = this.checkSupport();
    
    // Check for existing token in localStorage
    this.loadExistingToken();
  }

  private loadExistingToken() {
    try {
      const storedToken = localStorage.getItem('fcm_token');
      if (storedToken) {
        console.log('🔍 Found existing FCM token in storage');
        this.token = storedToken;
      }
    } catch (error) {
      console.log('Could not load existing token:', error);
    }
  }

  private checkSupport(): boolean {
    // FCM is only supported in web browsers, not in native mobile apps
    if (isPlatform('capacitor')) {
      console.log('FCM not supported on native platforms');
      return false;
    }

    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      console.log('Service workers not supported');
      return false;
    }

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return false;
    }

    return true;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.log('FCM not supported - missing requirements');
      return false;
    }

    try {
      console.log('Current notification permission:', Notification.permission);
      
      if (Notification.permission === 'granted') {
        console.log('Notification permission already granted');
        return true;
      }
      
      if (Notification.permission === 'denied') {
        console.log('Notification permission was previously denied');
        return false;
      }

      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        return true;
      } else {
        console.log('❌ Notification permission denied or dismissed');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async registerServiceWorker(): Promise<void> {
    if (!this.isSupported) {
      console.log('❌ Cannot register service worker - not supported');
      return;
    }

    try {
      console.log('📝 Registering service worker at /firebase-messaging-sw.js');
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker registered successfully:', {
        scope: registration.scope,
        updateViaCache: registration.updateViaCache,
        active: !!registration.active
      });
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker is ready');
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      console.error('This could be because:');
      console.error('  - The /firebase-messaging-sw.js file is missing or has errors');
      console.error('  - The app is not served over HTTPS (except localhost)');
      console.error('  - Browser doesn\'t support service workers');
      throw error;
    }
  }

  async getToken(): Promise<string | null> {
    console.log('🔄 FCM getToken() called');
    console.log('Support check:', { isSupported: this.isSupported, hasMessaging: !!messaging });
    
    if (!this.isSupported || !messaging) {
      console.log('❌ FCM not supported or messaging not available');
      return null;
    }

    try {
      console.log('🔐 Requesting permission...');
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log('❌ Permission not granted');
        return null;
      }

      console.log('📝 Registering service worker...');
      await this.registerServiceWorker();

      console.log('🎫 Getting FCM token with VAPID key...');
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });

      if (currentToken) {
        console.log('✅ FCM Token obtained successfully!');
        console.log('Token length:', currentToken.length);
        console.log('Token preview:', currentToken.substring(0, 20) + '...');
        this.token = currentToken;
        return currentToken;
      } else {
        console.log('❌ No registration token available - this could mean:');
        console.log('  - Notifications are blocked in browser settings');
        console.log('  - Service worker registration failed');
        console.log('  - VAPID key is invalid');
        console.log('  - Firebase project configuration issue');
        return null;
      }
    } catch (error) {
      console.error('❌ Error occurred while retrieving FCM token:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      return null;
    }
  }

  onForegroundMessage(callback: (payload: any) => void): void {
    if (!this.isSupported || !messaging) return;

    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      callback(payload);
    });
  }

  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    if (!this.isSupported) return;

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/images/logo.png',
        badge: '/images/logo.png',
        tag: 'weather-notification'
      });
    }
  }

  async getTokenAutomatically(): Promise<string | null> {
    console.log('🎯 Getting FCM token automatically...');
    
    if (!this.isSupported || !messaging) {
      console.log('❌ FCM not supported or messaging not available');
      return null;
    }

    try {
      // Register service worker first
      console.log('📝 Auto-registering service worker...');
      await this.registerServiceWorker();

      // Check current permission status
      const currentPermission = Notification.permission;
      console.log('🔐 Current notification permission:', currentPermission);

      if (currentPermission === 'denied') {
        console.log('❌ Notifications previously denied by user');
        return null;
      }

      if (currentPermission === 'default') {
        // Auto-request permission
        console.log('🔔 Auto-requesting notification permission...');
        const permission = await Notification.requestPermission();
        console.log('Permission result:', permission);
        
        if (permission !== 'granted') {
          console.log('❌ Permission not granted');
          return null;
        }
      }

      // Now get the token
      console.log('🎫 Getting FCM token with VAPID key...');
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });

      if (currentToken) {
        console.log('✅ FCM Token obtained automatically!');
        console.log('Token length:', currentToken.length);
        console.log('Token preview:', currentToken.substring(0, 20) + '...');
        this.token = currentToken;
        
        // Store token with timestamp
        localStorage.setItem('fcm_token', currentToken);
        localStorage.setItem('fcm_token_generated', new Date().toISOString());
        
        return currentToken;
      } else {
        console.log('❌ No token available');
        return null;
      }
    } catch (error) {
      console.error('❌ Auto FCM token generation failed:', error);
      return null;
    }
  }

  getCurrentToken(): string | null {
    return this.token;
  }

  isNotificationSupported(): boolean {
    return this.isSupported;
  }
}

export const fcmService = new FCMService();

// Auto-initialize FCM when the module loads (in supported browsers)
if (typeof window !== 'undefined' && fcmService.isNotificationSupported()) {
  // Small delay to ensure DOM is ready
  setTimeout(async () => {
    console.log('🚀 Auto-initializing FCM on module load...');
    try {
      await fcmService.getTokenAutomatically();
    } catch (error) {
      console.log('Auto FCM initialization completed with error (normal if permissions denied):', error);
    }
  }, 1000);
}
