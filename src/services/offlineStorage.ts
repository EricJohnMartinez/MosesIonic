/**
 * Offline Storage Service
 * Handles data persistence to localStorage with automatic expiry and compression
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiryMs: number;
}

export interface StorageMetadata {
  lastSync: number;
  version: string;
  isOnline: boolean;
}

/**
 * Save data to localStorage with expiry
 */
export function saveToCache<T>(key: string, data: T, expiryMs: number = 60 * 60 * 1000): void {
  try {
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiryMs
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
    console.log(`💾 Cached: ${key} (expires in ${expiryMs / 1000 / 60} minutes)`);
  } catch (e) {
    console.warn(`⚠️ Failed to save to cache (${key}):`, e);
  }
}

/**
 * Load data from localStorage with expiry check
 */
export function loadFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) {
      console.log(`📭 No cache found for: ${key}`);
      return null;
    }

    const cacheEntry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();
    const ageMs = now - cacheEntry.timestamp;

    // Check if cache has expired
    if (ageMs > cacheEntry.expiryMs) {
      console.log(`⏰ Cache expired for: ${key} (age: ${ageMs / 1000 / 60} minutes)`);
      localStorage.removeItem(key);
      return null;
    }

    const remainingMs = cacheEntry.expiryMs - ageMs;
    console.log(`✅ Cache hit: ${key} (${remainingMs / 1000 / 60} minutes remaining)`);
    return cacheEntry.data;
  } catch (e) {
    console.warn(`⚠️ Failed to load from cache (${key}):`, e);
    return null;
  }
}

/**
 * Check if cache exists and is still valid
 */
export function isCacheValid(key: string): boolean {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return false;

    const cacheEntry: CacheEntry<any> = JSON.parse(cached);
    const now = Date.now();
    const ageMs = now - cacheEntry.timestamp;

    return ageMs <= cacheEntry.expiryMs;
  } catch (e) {
    return false;
  }
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
  try {
    localStorage.removeItem(key);
    console.log(`🗑️ Cache cleared: ${key}`);
  } catch (e) {
    console.warn(`⚠️ Failed to clear cache (${key}):`, e);
  }
}

/**
 * Clear all cache entries matching a pattern
 */
export function clearCachePattern(pattern: RegExp | string): number {
  try {
    const patternRegex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let cleared = 0;

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && patternRegex.test(key)) {
        localStorage.removeItem(key);
        cleared++;
      }
    }

    console.log(`🗑️ Cleared ${cleared} cache entries matching: ${pattern}`);
    return cleared;
  } catch (e) {
    console.warn(`⚠️ Failed to clear cache pattern:`, e);
    return 0;
  }
}

/**
 * Get cache size in bytes
 */
export function getCacheSize(): number {
  try {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const item = localStorage.getItem(key);
        if (item) {
          size += item.length + key.length;
        }
      }
    }
    return size;
  } catch (e) {
    console.warn('⚠️ Failed to calculate cache size:', e);
    return 0;
  }
}

/**
 * Get all cache keys
 */
export function getAllCacheKeys(): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * Update storage metadata (last sync time, version, online status)
 */
export function updateStorageMetadata(isOnline: boolean): void {
  try {
    const metadata: StorageMetadata = {
      lastSync: Date.now(),
      version: '1.0.0',
      isOnline
    };
    localStorage.setItem('__storageMetadata__', JSON.stringify(metadata));
  } catch (e) {
    console.warn('⚠️ Failed to update storage metadata:', e);
  }
}

/**
 * Get storage metadata
 */
export function getStorageMetadata(): StorageMetadata {
  try {
    const metadata = localStorage.getItem('__storageMetadata__');
    if (!metadata) {
      return { lastSync: 0, version: '1.0.0', isOnline: false };
    }
    return JSON.parse(metadata);
  } catch (e) {
    return { lastSync: 0, version: '1.0.0', isOnline: false };
  }
}

/**
 * Initialize storage and handle migrations
 */
export function initializeStorage(): void {
  try {
    // Check storage availability
    const testKey = '__storageTest__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    console.log('✅ Storage initialized successfully');
  } catch (e) {
    console.warn('⚠️ Storage initialization failed:', e);
  }
}

/**
 * Get cache info for debugging
 */
export function getCacheInfo(key?: string): any {
  if (key) {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    try {
      const entry: CacheEntry<any> = JSON.parse(cached);
      return {
        key,
        size: cached.length,
        age: Date.now() - entry.timestamp,
        expiresIn: Math.max(0, entry.expiryMs - (Date.now() - entry.timestamp)),
        dataType: typeof entry.data
      };
    } catch (e) {
      return null;
    }
  }

  // Get all cache info
  const info: any[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && !k.startsWith('__')) {
      const cached = localStorage.getItem(k);
      if (cached) {
        try {
          const entry: CacheEntry<any> = JSON.parse(cached);
          info.push({
            key: k,
            size: cached.length,
            age: Date.now() - entry.timestamp,
            expiresIn: Math.max(0, entry.expiryMs - (Date.now() - entry.timestamp)),
            dataType: typeof entry.data
          });
        } catch (e) {
          // Skip invalid entries
        }
      }
    }
  }

  return info;
}

/**
 * Check if data was fetched today (daily cache strategy)
 * Returns true if data exists and was fetched today, false otherwise
 */
export function wasDataFetchedToday(key: string): boolean {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) {
      console.log(`📭 No cache found for daily check: ${key}`);
      return false;
    }

    const cacheEntry: CacheEntry<any> = JSON.parse(cached);
    const now = new Date();
    const cachedDate = new Date(cacheEntry.timestamp);

    // Check if same calendar day
    const isSameDay = 
      now.getFullYear() === cachedDate.getFullYear() &&
      now.getMonth() === cachedDate.getMonth() &&
      now.getDate() === cachedDate.getDate();

    if (isSameDay) {
      console.log(`✅ Data for ${key} was fetched today at ${cachedDate.toLocaleTimeString()}`);
      return true;
    } else {
      console.log(`📅 Data for ${key} is from yesterday (${cachedDate.toDateString()}), needs refresh`);
      return false;
    }
  } catch (e) {
    console.warn(`⚠️ Error checking daily cache for ${key}:`, e);
    return false;
  }
}

/**
 * Get the date when data was last fetched
 */
export function getLastFetchDate(key: string): Date | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const cacheEntry: CacheEntry<any> = JSON.parse(cached);
    return new Date(cacheEntry.timestamp);
  } catch (e) {
    return null;
  }
}

/**
 * Check if enough time has passed to justify a refresh (4 hours)
 * Use this for periodic background refreshes
 */
export function shouldRefreshCache(key: string, minimumAgeHours: number = 4): boolean {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return true;

    const cacheEntry: CacheEntry<any> = JSON.parse(cached);
    const now = Date.now();
    const ageHours = (now - cacheEntry.timestamp) / (1000 * 60 * 60);

    if (ageHours >= minimumAgeHours) {
      console.log(`⏰ Cache for ${key} is ${ageHours.toFixed(1)} hours old, should refresh`);
      return true;
    } else {
      console.log(`⏰ Cache for ${key} is only ${ageHours.toFixed(1)} hours old, no need to refresh`);
      return false;
    }
  } catch (e) {
    return true;
  }
}

