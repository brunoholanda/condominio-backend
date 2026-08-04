import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { Notification } from '../../../domain/entities/notification';
import { NotificationRepository } from '../../../domain/repositories/notification.repository';
import { NotificationOrmEntity } from './entities/notification.orm-entity';
import { NotificationMapper } from './notification.mapper';

@Injectable()
export class TypeormNotificationRepository extends NotificationRepository {
  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly repository: Repository<NotificationOrmEntity>,
  ) {
    super();
  }

  async save(notification: Notification): Promise<Notification> {
    await this.repository.save(NotificationMapper.toPersistence(notification));
    const row = await this.repository.findOne({ where: { id: notification.id } });

    if (!row) {
      throw new Error(`Falha ao persistir notificação ${notification.id}.`);
    }

    return NotificationMapper.toDomain(row);
  }

  async saveMany(notifications: Notification[]): Promise<Notification[]> {
    if (notifications.length === 0) {
      return [];
    }

    await this.repository.save(notifications.map((n) => NotificationMapper.toPersistence(n)));

    return notifications;
  }

  async findById(id: string): Promise<Notification | null> {
    const row = await this.repository.findOne({ where: { id } });

    return row ? NotificationMapper.toDomain(row) : null;
  }

  async listForUser(input: {
    userId: string;
    condominiumId?: string;
  }): Promise<Notification[]> {
    const where: Record<string, unknown> = { userId: input.userId };

    if (input.condominiumId) {
      where.condominiumId = input.condominiumId;
    }

    const rows = await this.repository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 100,
    });

    return rows.map((row) => NotificationMapper.toDomain(row));
  }

  async markAllRead(userId: string, condominiumId?: string): Promise<number> {
    const qb = this.repository
      .createQueryBuilder()
      .update(NotificationOrmEntity)
      .set({ readAt: () => 'NOW()' })
      .where('user_id = :userId', { userId })
      .andWhere('read_at IS NULL');

    if (condominiumId) {
      qb.andWhere('condominium_id = :condominiumId', { condominiumId });
    }

    const result = await qb.execute();

    return result.affected ?? 0;
  }

  async countUnread(userId: string, condominiumId?: string): Promise<number> {
    const where: Record<string, unknown> = {
      userId,
      readAt: IsNull(),
    };

    if (condominiumId) {
      where.condominiumId = condominiumId;
    }

    return this.repository.count({ where });
  }
}
