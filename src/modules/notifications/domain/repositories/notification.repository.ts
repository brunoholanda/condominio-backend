import type { Notification } from '../entities/notification';

export abstract class NotificationRepository {
  abstract save(notification: Notification): Promise<Notification>;

  abstract saveMany(notifications: Notification[]): Promise<Notification[]>;

  abstract findById(id: string): Promise<Notification | null>;

  abstract listForUser(input: {
    userId: string;
    condominiumId?: string;
  }): Promise<Notification[]>;

  abstract markAllRead(userId: string, condominiumId?: string): Promise<number>;

  abstract countUnread(userId: string, condominiumId?: string): Promise<number>;
}
