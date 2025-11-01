/**
 * Simple in-memory rate limiter
 * For production, consider using Redis for distributed rate limiting
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Unique identifier for the rate limit (e.g., IP address, user ID)
   */
  identifier: string;
  /**
   * Maximum number of requests allowed
   */
  limit: number;
  /**
   * Time window in seconds
   */
  windowInSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request should be rate limited
 * @param config - Rate limit configuration
 * @returns Rate limit result indicating if request is allowed
 */
export function rateLimit(config: RateLimitConfig): RateLimitResult {
  const { identifier, limit, windowInSeconds } = config;
  const now = Date.now();
  const resetTime = now + windowInSeconds * 1000;

  const record = store.get(identifier);

  if (!record || now > record.resetTime) {
    // First request or window has expired
    store.set(identifier, {
      count: 1,
      resetTime,
    });

    return {
      success: true,
      remaining: limit - 1,
      resetTime,
    };
  }

  if (record.count >= limit) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Increment count
  record.count += 1;

  return {
    success: true,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Get rate limit identifier from request
 * Priority: User ID > Session ID > IP Address
 */
export function getRateLimitIdentifier(
  req: Request,
  prefix: string,
  userId?: string
): string {
  if (userId) {
    return `${prefix}:user:${userId}`;
  }

  // Get IP from various headers (considering proxies)
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip =
    forwarded?.split(",")[0].trim() ||
    realIp ||
    req.headers.get("cf-connecting-ip") || // Cloudflare
    "unknown";

  return `${prefix}:ip:${ip}`;
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  // Strict limits for authentication endpoints
  AUTH: {
    limit: 5,
    windowInSeconds: 15 * 60, // 15 minutes
  },
  // Moderate limits for API endpoints
  API: {
    limit: 100,
    windowInSeconds: 60, // 1 minute
  },
  // Stricter limits for sensitive operations
  SENSITIVE: {
    limit: 10,
    windowInSeconds: 60, // 1 minute
  },
  // Very strict for webhooks
  WEBHOOK: {
    limit: 50,
    windowInSeconds: 60, // 1 minute
  },
} as const;
