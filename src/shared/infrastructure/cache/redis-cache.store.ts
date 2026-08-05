import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

import { CacheStore } from '../../application/ports/cache-store';

/**
 * Envelope so JSON `null` (negative lookup) is distinguishable from a miss
 * when the Redis key is absent.
 */
interface CacheEnvelope<T> {
  v: T;
}

@Injectable()
export class RedisCacheStore extends CacheStore implements OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheStore.name);
  private readonly client: Redis;

  constructor(options: {
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
  }) {
    super();
    this.client = new Redis({
      host: options.host,
      port: options.port,
      password: options.password || undefined,
      db: options.db,
      keyPrefix: options.keyPrefix,
      maxRetriesPerRequest: 2,
      lazyConnect: false,
      enableReadyCheck: true,
    });

    this.client.on('error', (error) => {
      this.logger.warn(`Redis error: ${error.message}`);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit().catch(() => undefined);
  }

  async get<T>(key: string): Promise<T | undefined> {
    const raw = await this.client.get(key);

    if (raw === null) {
      return undefined;
    }

    try {
      const envelope = JSON.parse(raw) as CacheEnvelope<T>;

      return envelope.v;
    } catch {
      await this.client.del(key);

      return undefined;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    const payload = JSON.stringify({ v: value } satisfies CacheEnvelope<unknown>);
    await this.client.set(key, payload, 'EX', Math.max(1, Math.floor(ttlSeconds)));
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    await this.client.del(...keys);
  }
}
