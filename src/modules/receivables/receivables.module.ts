import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CondominiumsModule } from '../condominiums/condominiums.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ResidentsModule } from '../residents/residents.module';
import {
  GetAsaasSettingsUseCase,
  RequireAsaasSettingsUseCase,
  UpsertAsaasSettingsUseCase,
} from './application/use-cases/asaas-settings.use-case';
import { CancelChargeUseCase } from './application/use-cases/cancel-charge.use-case';
import { GenerateChargesUseCase } from './application/use-cases/generate-charges.use-case';
import { HandleAsaasWebhookUseCase } from './application/use-cases/handle-asaas-webhook.use-case';
import {
  GetChargeUseCase,
  ListChargesUseCase,
  SummarizeChargesUseCase,
} from './application/use-cases/list-charges.use-case';
import { RemindPendingChargesUseCase } from './application/use-cases/remind-pending-charges.use-case';
import { ChargeBatchRepository } from './domain/repositories/charge-batch.repository';
import { ChargeStatusHistoryRepository } from './domain/repositories/charge-status-history.repository';
import { ChargeRepository } from './domain/repositories/charge.repository';
import { CondoAsaasSettingsRepository } from './domain/repositories/condo-asaas-settings.repository';
import { AsaasClient } from './infrastructure/asaas/asaas.client';
import { ChargeBatchOrmEntity } from './infrastructure/persistence/typeorm/entities/charge-batch.orm-entity';
import { ChargeStatusHistoryOrmEntity } from './infrastructure/persistence/typeorm/entities/charge-status-history.orm-entity';
import { ChargeOrmEntity } from './infrastructure/persistence/typeorm/entities/charge.orm-entity';
import { CondoAsaasSettingsOrmEntity } from './infrastructure/persistence/typeorm/entities/condo-asaas-settings.orm-entity';
import { TypeormChargeBatchRepository } from './infrastructure/persistence/typeorm/typeorm-charge-batch.repository';
import { TypeormChargeStatusHistoryRepository } from './infrastructure/persistence/typeorm/typeorm-charge-status-history.repository';
import { TypeormChargeRepository } from './infrastructure/persistence/typeorm/typeorm-charge.repository';
import { TypeormCondoAsaasSettingsRepository } from './infrastructure/persistence/typeorm/typeorm-condo-asaas-settings.repository';
import { AsaasWebhookController } from './presentation/asaas-webhook.controller';
import { ChargesController } from './presentation/charges.controller';

@Module({
  imports: [
    CondominiumsModule,
    ResidentsModule,
    NotificationsModule,
    TypeOrmModule.forFeature([
      ChargeOrmEntity,
      ChargeBatchOrmEntity,
      ChargeStatusHistoryOrmEntity,
      CondoAsaasSettingsOrmEntity,
    ]),
  ],
  controllers: [ChargesController, AsaasWebhookController],
  providers: [
    AsaasClient,
    { provide: ChargeRepository, useClass: TypeormChargeRepository },
    { provide: ChargeBatchRepository, useClass: TypeormChargeBatchRepository },
    { provide: ChargeStatusHistoryRepository, useClass: TypeormChargeStatusHistoryRepository },
    { provide: CondoAsaasSettingsRepository, useClass: TypeormCondoAsaasSettingsRepository },
    UpsertAsaasSettingsUseCase,
    GetAsaasSettingsUseCase,
    RequireAsaasSettingsUseCase,
    GenerateChargesUseCase,
    ListChargesUseCase,
    GetChargeUseCase,
    SummarizeChargesUseCase,
    CancelChargeUseCase,
    RemindPendingChargesUseCase,
    HandleAsaasWebhookUseCase,
  ],
})
export class ReceivablesModule {}
