/**
 * Simple in-memory cache for database query results
 * For production with multiple instances, consider Redis or similar distributed cache
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class Cache {
  private store: Map<string, CacheEntry<unknown>>;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.store = new Map();

    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set value in cache with TTL (time to live) in seconds
   */
  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { data: value, expiresAt });
  }

  /**
   * Delete specific key from cache
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Delete all keys matching a pattern
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Destroy cache and cleanup interval
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Export singleton instance
export const cache = new Cache();

/**
 * Cache wrapper for async functions with automatic key generation
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Store in cache
  cache.set(key, data, ttlSeconds);

  return data;
}

/**
 * Cache TTL presets (in seconds)
 */
export const CacheTTL = {
  /** 5 minutes - for frequently changing data */
  SHORT: 5 * 60,
  /** 15 minutes - for moderately stable data */
  MEDIUM: 15 * 60,
  /** 1 hour - for stable data */
  LONG: 60 * 60,
  /** 24 hours - for rarely changing data */
  VERY_LONG: 24 * 60 * 60,
} as const;

/**
 * Cache key generators for consistency
 */
export const CacheKeys = {
  dashboard: {
    stats: () => "dashboard:stats",
    revenueChart: () => "dashboard:revenue-chart",
    ordersChart: () => "dashboard:orders-chart",
  },
  product: {
    detail: (id: string) => `product:${id}`,
    list: (filters: string) => `product:list:${filters}`,
    search: (query: string) => `product:search:${query}`,
  },
  campaign: {
    active: () => "campaign:active",
    detail: (id: string) => `campaign:${id}`,
  },
  voucher: {
    code: (code: string) => `voucher:code:${code.toUpperCase()}`,
    batch: (id: string) => `voucher:batch:${id}`,
  },
} as const;

/**
 * Cache invalidation helpers
 */
export const invalidateCache = {
  /** Invalidate all dashboard cache */
  dashboard: () => {
    cache.deletePattern("^dashboard:");
  },
  /** Invalidate specific product cache */
  product: (id?: string) => {
    if (id) {
      cache.delete(CacheKeys.product.detail(id));
    } else {
      cache.deletePattern("^product:");
    }
  },
  /** Invalidate campaign cache */
  campaign: (id?: string) => {
    if (id) {
      cache.delete(CacheKeys.campaign.detail(id));
    } else {
      cache.deletePattern("^campaign:");
    }
  },
  /** Invalidate voucher cache */
  voucher: (code?: string) => {
    if (code) {
      cache.delete(CacheKeys.voucher.code(code));
    } else {
      cache.deletePattern("^voucher:");
    }
  },
  /** Invalidate all cache */
  all: () => {
    cache.clear();
  },
} as const;
