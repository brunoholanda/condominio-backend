import { Injectable } from '@nestjs/common';

import { CacheStore } from '../../application/ports/cache-store';

interface MemoryEntry {
  value: unknown;
  expiresAt: number;
}

/**
 * Process-local fallback when Redis is disabled (tests / local without Docker).
 * Not shared across instances — enable Redis for multi-instance deployments.
 */
@Injectable()
export class MemoryCacheStore extends CacheStore {
  private readonly store = new Map<string, MemoryEntry>();

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key);

    if (!entry) {
      return undefined;
    }

    if (Date.now() >= entry.expiresAt) {
      this.store.delete(key);

      return undefined;
    }

    return entry.value as T;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + Math.max(1, Math.floor(ttlSeconds)) * 1000,
    });
  }

  async del(...keys: string[]): Promise<void> {
    for (const key of keys) {
      this.store.delete(key);
    }
  }
}
