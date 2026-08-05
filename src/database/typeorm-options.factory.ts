import type { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'node:path';

import type { EnvironmentVariables } from '../config/environment';

/** Single place where the database connection is described, reused by Nest and by the CLI. */
export function buildTypeOrmOptions(
  env: Pick<
    EnvironmentVariables,
    | 'DATABASE_HOST'
    | 'DATABASE_PORT'
    | 'DATABASE_USER'
    | 'DATABASE_PASSWORD'
    | 'DATABASE_NAME'
    | 'DATABASE_SSL'
    | 'DATABASE_LOGGING'
  >,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    username: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
    logging: env.DATABASE_LOGGING,
    autoLoadEntities: true,
    // Schema changes always go through migrations, never through synchronize.
    synchronize: false,
    // Resolve relative to this file so Nest (dist/) and the CLI (src/) both find them.
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
    // Apply pending migrations on boot — avoids production deploys with schema lag.
    migrationsRun: true,
  };
}

export function typeOrmOptionsFromConfig(config: ConfigService<EnvironmentVariables, true>) {
  return buildTypeOrmOptions({
    DATABASE_HOST: config.get('DATABASE_HOST', { infer: true }),
    DATABASE_PORT: config.get('DATABASE_PORT', { infer: true }),
    DATABASE_USER: config.get('DATABASE_USER', { infer: true }),
    DATABASE_PASSWORD: config.get('DATABASE_PASSWORD', { infer: true }),
    DATABASE_NAME: config.get('DATABASE_NAME', { infer: true }),
    DATABASE_SSL: config.get('DATABASE_SSL', { infer: true }),
    DATABASE_LOGGING: config.get('DATABASE_LOGGING', { infer: true }),
  });
}
