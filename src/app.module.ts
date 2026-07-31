import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import type { EnvironmentVariables } from './config/environment';
import { validateEnvironment } from './config/environment';
import { typeOrmOptionsFromConfig } from './database/typeorm-options.factory';
import { AuthModule } from './modules/auth/auth.module';
import { ResidentsModule } from './modules/residents/residents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) =>
        typeOrmOptionsFromConfig(config),
    }),
    AuthModule,
    ResidentsModule,
  ],
})
export class AppModule {}
