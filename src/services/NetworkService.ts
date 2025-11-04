import { ref, computed } from 'vue';
import { Network, NetworkStatus } from '@capacitor/network';

export class NetworkService {
  private isOnline = ref(true);
  private connectionType = ref<string>('unknown');

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Get initial network status
      const status = await Network.getStatus();
      this.isOnline.value = status.connected;
      this.connectionType.value = status.connectionType;

      // Listen for network changes
      Network.addListener('networkStatusChange', (status: NetworkStatus) => {
        console.log('Network status changed:', status);
        this.isOnline.value = status.connected;
        this.connectionType.value = status.connectionType;
      });
    } catch (error) {
      console.warn('Network plugin not available, assuming online:', error);
      // Fallback to navigator.onLine for web
      this.isOnline.value = navigator.onLine;
      this.connectionType.value = 'unknown';

      // Listen to online/offline events
      window.addEventListener('online', () => {
        this.isOnline.value = true;
        console.log('Network: Online');
      });

      window.addEventListener('offline', () => {
        this.isOnline.value = false;
        console.log('Network: Offline');
      });
    }
  }

  get online(): boolean {
    return this.isOnline.value;
  }

  get offline(): boolean {
    return !this.isOnline.value;
  }

  get connectionTypeValue(): string {
    return this.connectionType.value;
  }

  // Reactive computed properties for Vue components
  get isOnlineRef() {
    return computed(() => this.isOnline.value);
  }

  get isOfflineRef() {
    return computed(() => !this.isOnline.value);
  }

  // Method to manually check network status
  async checkStatus(): Promise<boolean> {
    try {
      const status = await Network.getStatus();
      this.isOnline.value = status.connected;
      this.connectionType.value = status.connectionType;
      return status.connected;
    } catch (error) {
      // Fallback to navigator.onLine
      this.isOnline.value = navigator.onLine;
      return navigator.onLine;
    }
  }
}

// Singleton instance
export const networkService = new NetworkService();