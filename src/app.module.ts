import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import type { EnvironmentVariables } from './config/environment';
import { validateEnvironment } from './config/environment';
import { typeOrmOptionsFromConfig } from './database/typeorm-options.factory';
import { AuthModule } from './modules/auth/auth.module';
import { CommonAreasModule } from './modules/common-areas/common-areas.module';
import { CondominiumsModule } from './modules/condominiums/condominiums.module';
import { DirectoryModule } from './modules/directory/directory.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { FinanceModule } from './modules/finance/finance.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ResidentsModule } from './modules/residents/residents.module';
import { SuggestionsModule } from './modules/suggestions/suggestions.module';
import { PlatformAdminModule } from './modules/platform-admin/platform-admin.module';
import { SupportModule } from './modules/support/support.module';
import { BillingModule } from './modules/billing/billing.module';
import { ReceivablesModule } from './modules/receivables/receivables.module';
import { StaffModule } from './modules/staff/staff.module';
import { VisitorsModule } from './modules/visitors/visitors.module';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module';
import { PrivacyModule } from './modules/privacy/privacy.module';
import { CacheModule } from './shared/infrastructure/cache/cache.module';
import { CryptoModule } from './shared/infrastructure/crypto/crypto.module';
import { AuditAccessInterceptor } from './shared/infrastructure/http/audit-access.interceptor';
import { AuditModule } from './shared/infrastructure/http/audit.module';
import { StorageModule } from './shared/infrastructure/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnvironment,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 120 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) =>
        typeOrmOptionsFromConfig(config),
    }),
    CacheModule,
    CryptoModule,
    AuditModule,
    AuthModule,
    CondominiumsModule,
    StorageModule,
    ResidentsModule,
    FinanceModule,
    ReceivablesModule,
    CommonAreasModule,
    DocumentsModule,
    DirectoryModule,
    DeliveriesModule,
    SuggestionsModule,
    PlatformAdminModule,
    SupportModule,
    BillingModule,
    StaffModule,
    NotificationsModule,
    VisitorsModule,
    WorkOrdersModule,
    PrivacyModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditAccessInterceptor },
  ],
})
export class AppModule {}
