import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import {
  CountUnreadNotificationsUseCase,
  CreateNotificationUseCase,
  ListMyNotificationsUseCase,
  MarkAllNotificationsReadUseCase,
  MarkNotificationReadUseCase,
} from './application/use-cases/notification.use-case';
import { NotificationRepository } from './domain/repositories/notification.repository';
import { NotificationOrmEntity } from './infrastructure/persistence/typeorm/entities/notification.orm-entity';
import { TypeormNotificationRepository } from './infrastructure/persistence/typeorm/typeorm-notification.repository';
import { NotificationsController } from './presentation/notifications.controller';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([NotificationOrmEntity])],
  controllers: [NotificationsController],
  providers: [
    { provide: NotificationRepository, useClass: TypeormNotificationRepository },
    CreateNotificationUseCase,
    ListMyNotificationsUseCase,
    MarkNotificationReadUseCase,
    MarkAllNotificationsReadUseCase,
    CountUnreadNotificationsUseCase,
  ],
  exports: [CreateNotificationUseCase],
})
export class NotificationsModule {}
