/**
 * Port for a key-value cache (Redis in production, in-memory fallback).
 *
 * Values are JSON-serializable. Callers revive domain types (Dates, aggregates)
 * after a hit. Misses return `undefined` so callers can distinguish "not cached"
 * from a cached `null` (negative lookup).
 */
export abstract class CacheStore {
  /** Returns `undefined` on miss. */
  abstract get<T>(key: string): Promise<T | undefined>;

  abstract set(key: string, value: unknown, ttlSeconds: number): Promise<void>;

  abstract del(...keys: string[]): Promise<void>;

  /**
   * Cache-aside helper: serve from cache, otherwise run `factory`, store the
   * result (including `null`) and return it.
   */
  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttlSeconds);

    return value;
  }
}
