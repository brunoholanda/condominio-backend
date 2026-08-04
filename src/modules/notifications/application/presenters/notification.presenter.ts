import type { Notification } from '../../domain/entities/notification';
import type { NotificationResponseDto } from '../dto/notification.dto';

export const NotificationPresenter = {
  toResponse(notification: Notification): NotificationResponseDto {
    const s = notification.toSnapshot();

    return {
      id: s.id,
      condominiumId: s.condominiumId,
      userId: s.userId,
      title: s.title,
      body: s.body,
      category: s.category,
      linkPath: s.linkPath,
      readAt: s.readAt?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
    };
  },
};
