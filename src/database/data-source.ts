import { config as loadEnvFile } from 'dotenv';
import { join } from 'node:path';
import { DataSource, type DataSourceOptions } from 'typeorm';

import { validateEnvironment } from '../config/environment';
import { buildTypeOrmOptions } from './typeorm-options.factory';

loadEnvFile();

const env = validateEnvironment(process.env);

/** DataSource used exclusively by the TypeORM CLI (migrations). */
export default new DataSource({
  ...(buildTypeOrmOptions(env) as DataSourceOptions),
  // Works for `ts-node` (src/) and compiled `dist/` CLI runs.
  entities: [join(__dirname, '..', '**', '*.orm-entity.{ts,js}')],
});
