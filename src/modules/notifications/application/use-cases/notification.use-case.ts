import { Injectable } from '@nestjs/common';

import {
  BusinessRuleError,
  ResourceNotFoundError,
} from '../../../../shared/domain/domain-error';
import { Notification } from '../../domain/entities/notification';
import type { NotificationCategory } from '../../domain/enums/notification-category';
import { NotificationRepository } from '../../domain/repositories/notification.repository';
import type {
  CreateNotificationDto,
  ListNotificationsQueryDto,
  MarkAllReadResponseDto,
  NotificationResponseDto,
  UnreadCountResponseDto,
} from '../dto/notification.dto';
import { NotificationPresenter } from '../presenters/notification.presenter';

@Injectable()
export class CreateNotificationUseCase {
  constructor(private readonly notifications: NotificationRepository) {}

  async execute(input: CreateNotificationDto): Promise<NotificationResponseDto> {
    const notification = await this.notifications.save(
      Notification.create({
        condominiumId: input.condominiumId,
        userId: input.userId,
        title: input.title,
        body: input.body,
        category: input.category,
        linkPath: input.linkPath,
      }),
    );

    return NotificationPresenter.toResponse(notification);
  }

  async executeMany(
    items: Array<{
      condominiumId: string;
      userId: string;
      title: string;
      body: string;
      category: NotificationCategory;
      linkPath?: string | null;
    }>,
  ): Promise<void> {
    if (items.length === 0) {
      return;
    }

    await this.notifications.saveMany(items.map((item) => Notification.create(item)));
  }
}

@Injectable()
export class ListMyNotificationsUseCase {
  constructor(private readonly notifications: NotificationRepository) {}

  async execute(
    userId: string,
    query: ListNotificationsQueryDto,
  ): Promise<NotificationResponseDto[]> {
    const list = await this.notifications.listForUser({
      userId,
      condominiumId: query.condominiumId,
    });

    return list.map((n) => NotificationPresenter.toResponse(n));
  }
}

@Injectable()
export class MarkNotificationReadUseCase {
  constructor(private readonly notifications: NotificationRepository) {}

  async execute(userId: string, id: string): Promise<NotificationResponseDto> {
    const current = await this.notifications.findById(id);

    if (!current) {
      throw new ResourceNotFoundError('Notificação não encontrada.');
    }

    if (!current.userId || current.userId !== userId) {
      throw new BusinessRuleError('Esta notificação não pertence ao usuário autenticado.');
    }

    const updated = await this.notifications.save(current.markRead());

    return NotificationPresenter.toResponse(updated);
  }
}

@Injectable()
export class MarkAllNotificationsReadUseCase {
  constructor(private readonly notifications: NotificationRepository) {}

  async execute(
    userId: string,
    condominiumId?: string,
  ): Promise<MarkAllReadResponseDto> {
    const updated = await this.notifications.markAllRead(userId, condominiumId);

    return { updated };
  }
}

@Injectable()
export class CountUnreadNotificationsUseCase {
  constructor(private readonly notifications: NotificationRepository) {}

  async execute(
    userId: string,
    condominiumId?: string,
  ): Promise<UnreadCountResponseDto> {
    const count = await this.notifications.countUnread(userId, condominiumId);

    return { count };
  }
}
