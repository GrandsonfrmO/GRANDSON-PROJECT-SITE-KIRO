/**
 * Cache Manager for Production
 * Handles client-side caching with TTL and invalidation
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private storage: Storage;
  private prefix: string = 'app_cache_';

  constructor() {
    // Use sessionStorage for production (cleared on tab close)
    this.storage = typeof window !== 'undefined' ? window.sessionStorage : ({} as Storage);
  }

  /**
   * Set cache entry with TTL
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      this.storage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.warn('Cache set failed:', error);
    }
  }

  /**
   * Get cache entry if not expired
   */
  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(this.prefix + key);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      const age = Date.now() - entry.timestamp;

      if (age > entry.ttl) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  /**
   * Remove cache entry
   */
  remove(key: string): void {
    try {
      this.storage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('Cache remove failed:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    try {
      const keys = Object.keys(this.storage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          this.storage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    try {
      const keys = Object.keys(this.storage).filter((key) =>
        key.startsWith(this.prefix)
      );
      return {
        size: keys.length,
        keys: keys.map((key) => key.replace(this.prefix, '')),
      };
    } catch (error) {
      return { size: 0, keys: [] };
    }
  }
}

export const cacheManager = new CacheManager();
