import { config as loadEnvFile } from 'dotenv';
import { DataSource, type DataSourceOptions } from 'typeorm';

import { validateEnvironment } from '../config/environment';
import { buildTypeOrmOptions } from './typeorm-options.factory';

loadEnvFile();

const env = validateEnvironment(process.env);

/** DataSource used exclusively by the TypeORM CLI (migrations). */
export default new DataSource({
  ...(buildTypeOrmOptions(env) as DataSourceOptions),
  entities: ['src/**/*.orm-entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
});
