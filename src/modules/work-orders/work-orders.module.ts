import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CondominiumsModule } from '../condominiums/condominiums.module';
import {
  CreateWorkOrderUseCase,
  ListWorkOrdersUseCase,
  UpdateWorkOrderStatusUseCase,
} from './application/use-cases/work-order.use-case';
import { WorkOrderRepository } from './domain/repositories/work-order.repository';
import { WorkOrderOrmEntity } from './infrastructure/persistence/typeorm/entities/work-order.orm-entity';
import { TypeormWorkOrderRepository } from './infrastructure/persistence/typeorm/typeorm-work-order.repository';
import { WorkOrdersController } from './presentation/work-orders.controller';

@Module({
  imports: [CondominiumsModule, TypeOrmModule.forFeature([WorkOrderOrmEntity])],
  controllers: [WorkOrdersController],
  providers: [
    { provide: WorkOrderRepository, useClass: TypeormWorkOrderRepository },
    CreateWorkOrderUseCase,
    ListWorkOrdersUseCase,
    UpdateWorkOrderStatusUseCase,
  ],
})
export class WorkOrdersModule {}
