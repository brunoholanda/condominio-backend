import type { DeepPartial } from 'typeorm';

import { Notification } from '../../../domain/entities/notification';
import type { NotificationOrmEntity } from './entities/notification.orm-entity';

export const NotificationMapper = {
  toDomain(row: NotificationOrmEntity): Notification {
    return Notification.restore({
      id: row.id,
      condominiumId: row.condominiumId,
      userId: row.userId,
      title: row.title,
      body: row.body,
      category: row.category,
      linkPath: row.linkPath,
      readAt: row.readAt,
      createdAt: row.createdAt,
    });
  },

  toPersistence(notification: Notification): DeepPartial<NotificationOrmEntity> {
    const s = notification.toSnapshot();

    return {
      id: s.id,
      condominiumId: s.condominiumId,
      userId: s.userId,
      title: s.title,
      body: s.body,
      category: s.category,
      linkPath: s.linkPath,
      readAt: s.readAt,
      createdAt: s.createdAt,
    };
  },
};
