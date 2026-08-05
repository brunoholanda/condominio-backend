import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CondominiumsModule } from '../condominiums/condominiums.module';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  CancelVisitorPassUseCase,
  CheckInVisitorPassUseCase,
  CreateVisitorPassUseCase,
  ListVisitorPassesUseCase,
} from './application/use-cases/visitor-pass.use-case';
import { VisitorPassRepository } from './domain/repositories/visitor-pass.repository';
import { VisitorPassOrmEntity } from './infrastructure/persistence/typeorm/entities/visitor-pass.orm-entity';
import { TypeormVisitorPassRepository } from './infrastructure/persistence/typeorm/typeorm-visitor-pass.repository';
import { VisitorsController } from './presentation/visitors.controller';

@Module({
  imports: [
    CondominiumsModule,
    NotificationsModule,
    TypeOrmModule.forFeature([VisitorPassOrmEntity]),
  ],
  controllers: [VisitorsController],
  providers: [
    { provide: VisitorPassRepository, useClass: TypeormVisitorPassRepository },
    CreateVisitorPassUseCase,
    ListVisitorPassesUseCase,
    CheckInVisitorPassUseCase,
    CancelVisitorPassUseCase,
  ],
  exports: [
    CreateVisitorPassUseCase,
    ListVisitorPassesUseCase,
    CheckInVisitorPassUseCase,
  ],
})
export class VisitorsModule {}
