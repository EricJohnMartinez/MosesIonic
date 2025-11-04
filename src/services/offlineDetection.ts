/**
 * Offline Detection Service
 * Monitors online/offline status and triggers data sync callbacks
 */

export interface OfflineDetectionConfig {
  onlineCallback?: () => void | Promise<void>;
  offlineCallback?: () => void | Promise<void>;
  checkInterval?: number; // ms between connectivity checks
  enableLogging?: boolean;
}

export type OfflineStatusListener = (isOnline: boolean) => void | Promise<void>;

class OfflineDetectionService {
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<OfflineStatusListener> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private config: Required<OfflineDetectionConfig>;

  constructor(config: OfflineDetectionConfig = {}) {
    this.config = {
      onlineCallback: config.onlineCallback || (() => {}),
      offlineCallback: config.offlineCallback || (() => {}),
      checkInterval: config.checkInterval || 5000, // 5 seconds
      enableLogging: config.enableLogging ?? true
    };

    this.initialize();
  }

  /**
   * Initialize offline detection
   */
  private initialize(): void {
    // Listen to browser online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Start periodic connectivity check
    this.startPeriodicCheck();

    this.log('📡 Offline detection service initialized');
  }

  /**
   * Handle online event
   */
  private async handleOnline(): Promise<void> {
    if (this.isOnline) return; // Already online

    this.isOnline = true;
    this.log('🟢 Device is ONLINE - syncing data...');

    // Update metadata
    const { updateStorageMetadata } = await import('./offlineStorage');
    updateStorageMetadata(true);

    // Call online callback
    try {
      await this.config.onlineCallback();
    } catch (error) {
      this.log('❌ Error in online callback:', error);
    }

    // Notify all listeners
    await this.notifyListeners(true);
  }

  /**
   * Handle offline event
   */
  private async handleOffline(): Promise<void> {
    if (!this.isOnline) return; // Already offline

    this.isOnline = false;
    this.log('🔴 Device is OFFLINE - using cached data');

    // Update metadata
    const { updateStorageMetadata } = await import('./offlineStorage');
    updateStorageMetadata(false);

    // Call offline callback
    try {
      await this.config.offlineCallback();
    } catch (error) {
      this.log('❌ Error in offline callback:', error);
    }

    // Notify all listeners
    await this.notifyListeners(false);
  }

  /**
   * Start periodic connectivity check (additional to browser events)
   */
  private startPeriodicCheck(): void {
    this.checkInterval = setInterval(async () => {
      try {
        // Attempt to fetch a small resource to verify connectivity
        const response = await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache',
          mode: 'no-cors'
        });

        if (!this.isOnline) {
          await this.handleOnline();
        }
      } catch (error) {
        if (this.isOnline) {
          await this.handleOffline();
        }
      }
    }, this.config.checkInterval);
  }

  /**
   * Stop periodic connectivity check
   */
  private stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Notify all listeners of status change
   */
  private async notifyListeners(isOnline: boolean): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const listener of this.listeners) {
      try {
        promises.push(Promise.resolve(listener(isOnline)));
      } catch (error) {
        this.log('❌ Error notifying listener:', error);
      }
    }

    await Promise.all(promises);
  }

  /**
   * Get current online status
   */
  public getStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Register a status change listener
   */
  public addListener(listener: OfflineStatusListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Remove a listener
   */
  public removeListener(listener: OfflineStatusListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Clear all listeners
   */
  public clearListeners(): void {
    this.listeners.clear();
  }

  /**
   * Destroy the service
   */
  public destroy(): void {
    window.removeEventListener('online', () => this.handleOnline());
    window.removeEventListener('offline', () => this.handleOffline());
    this.stopPeriodicCheck();
    this.clearListeners();
    this.log('📡 Offline detection service destroyed');
  }

  /**
   * Internal logging
   */
  private log(...args: any[]): void {
    if (this.config.enableLogging) {
      console.log('[OfflineDetection]', ...args);
    }
  }
}

// Create singleton instance
let instance: OfflineDetectionService | null = null;

/**
 * Get or create the singleton instance
 */
export function getOfflineDetectionService(
  config?: OfflineDetectionConfig
): OfflineDetectionService {
  if (!instance) {
    instance = new OfflineDetectionService(config);
  }
  return instance;
}

/**
 * Destroy the singleton instance
 */
export function destroyOfflineDetectionService(): void {
  if (instance) {
    instance.destroy();
    instance = null;
  }
}

/**
 * Quick function to check if device is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Quick function to check if device is offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

export default OfflineDetectionService;
