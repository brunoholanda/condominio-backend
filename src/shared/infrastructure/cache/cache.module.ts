import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { EnvironmentVariables } from '../../../config/environment';
import { CacheStore } from '../../application/ports/cache-store';
import { MemoryCacheStore } from './memory-cache.store';
import { RedisCacheStore } from './redis-cache.store';

@Global()
@Module({
  providers: [
    {
      provide: CacheStore,
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>): CacheStore => {
        const logger = new Logger('CacheModule');
        const enabled = config.get('REDIS_ENABLED', { infer: true });

        if (!enabled) {
          logger.warn(
            'Redis desabilitado (REDIS_ENABLED=false). Usando cache em memória do processo.',
          );

          return new MemoryCacheStore();
        }

        const host = config.get('REDIS_HOST', { infer: true });
        const port = config.get('REDIS_PORT', { infer: true });
        const password = config.get('REDIS_PASSWORD', { infer: true });
        const db = config.get('REDIS_DB', { infer: true });
        const keyPrefix = config.get('REDIS_KEY_PREFIX', { infer: true });

        logger.log(`Cache Redis em ${host}:${port} (db=${db}, prefix=${keyPrefix})`);

        return new RedisCacheStore({
          host,
          port,
          password: password || undefined,
          db,
          keyPrefix,
        });
      },
    },
  ],
  exports: [CacheStore],
})
export class CacheModule {}
