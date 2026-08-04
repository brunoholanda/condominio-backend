import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

import { NotificationCategory } from '../../../../domain/enums/notification-category';

@Entity('notifications')
@Index('idx_notifications_user_unread', ['userId', 'readAt', 'createdAt'])
@Index('idx_notifications_condo', ['condominiumId', 'createdAt'])
export class NotificationOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ name: 'title', type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'body', type: 'varchar', length: 2000 })
  body: string;

  @Column({ name: 'category', type: 'varchar', length: 40 })
  category: NotificationCategory;

  @Column({ name: 'link_path', type: 'varchar', length: 255, nullable: true })
  linkPath: string | null;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
