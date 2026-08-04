import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CondominiumsModule } from '../condominiums/condominiums.module';
import { StorageModule } from '../../shared/infrastructure/storage/storage.module';
import { AddAttachmentUseCase } from './application/use-cases/add-attachment.use-case';
import { CancelPayableUseCase } from './application/use-cases/cancel-payable.use-case';
import { CreatePayableUseCase } from './application/use-cases/create-payable.use-case';
import { DeleteAttachmentUseCase } from './application/use-cases/delete-attachment.use-case';
import { DownloadAttachmentUseCase } from './application/use-cases/download-attachment.use-case';
import { DownloadTransparencyAttachmentUseCase } from './application/use-cases/download-transparency-attachment.use-case';
import { GetPayableUseCase } from './application/use-cases/get-payable.use-case';
import { GetTransparencyPayableUseCase } from './application/use-cases/get-transparency-payable.use-case';
import { ListAttachmentsUseCase } from './application/use-cases/list-attachments.use-case';
import { ListPayablesUseCase } from './application/use-cases/list-payables.use-case';
import { ListTransparencyPayablesUseCase } from './application/use-cases/list-transparency-payables.use-case';
import { MarkPayableAsPaidUseCase } from './application/use-cases/mark-payable-as-paid.use-case';
import { UpdatePayableUseCase } from './application/use-cases/update-payable.use-case';
import { AttachmentRepository } from './domain/repositories/attachment.repository';
import { PayableRepository } from './domain/repositories/payable.repository';
import { PayableStatusHistoryRepository } from './domain/repositories/payable-status-history.repository';
import { AttachmentOrmEntity } from './infrastructure/persistence/typeorm/entities/attachment.orm-entity';
import { PayableStatusHistoryOrmEntity } from './infrastructure/persistence/typeorm/entities/payable-status-history.orm-entity';
import { PayableOrmEntity } from './infrastructure/persistence/typeorm/entities/payable.orm-entity';
import { TypeormAttachmentRepository } from './infrastructure/persistence/typeorm/typeorm-attachment.repository';
import { TypeormPayableStatusHistoryRepository } from './infrastructure/persistence/typeorm/typeorm-payable-status-history.repository';
import { TypeormPayableRepository } from './infrastructure/persistence/typeorm/typeorm-payable.repository';
import { PayableAttachmentsController } from './presentation/payable-attachments.controller';
import { PayablesController } from './presentation/payables.controller';
import { PublicTransparencyController } from './presentation/public-transparency.controller';

@Module({
  imports: [
    CondominiumsModule,
    StorageModule,
    TypeOrmModule.forFeature([
      PayableOrmEntity,
      PayableStatusHistoryOrmEntity,
      AttachmentOrmEntity,
    ]),
  ],
  controllers: [PayablesController, PayableAttachmentsController, PublicTransparencyController],
  providers: [
    { provide: PayableRepository, useClass: TypeormPayableRepository },
    { provide: PayableStatusHistoryRepository, useClass: TypeormPayableStatusHistoryRepository },
    { provide: AttachmentRepository, useClass: TypeormAttachmentRepository },
    CreatePayableUseCase,
    ListPayablesUseCase,
    GetPayableUseCase,
    UpdatePayableUseCase,
    MarkPayableAsPaidUseCase,
    CancelPayableUseCase,
    AddAttachmentUseCase,
    ListAttachmentsUseCase,
    DownloadAttachmentUseCase,
    DeleteAttachmentUseCase,
    ListTransparencyPayablesUseCase,
    GetTransparencyPayableUseCase,
    DownloadTransparencyAttachmentUseCase,
  ],
})
export class FinanceModule {}
