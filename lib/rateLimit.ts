/**
 * In-memory rate limiter.
 * Resets on server restart — replace with @upstash/ratelimit before production launch.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

/**
 * Returns true if the request is within the limit, false if it should be blocked.
 * @param key     Identifier (IP address)
 * @param limit   Max requests per window (default: 5)
 * @param windowMs  Window duration in ms (default: 1 hour)
 */
export function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 3_600_000
): boolean {
  const now = Date.now()

  // Prune expired entries
  for (const [k, entry] of store.entries()) {
    if (entry.resetAt <= now) store.delete(k)
  }

  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) {
    return false
  }

  entry.count++
  return true
}
