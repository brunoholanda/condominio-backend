import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TicketCategory } from '../../../../domain/enums/ticket-category';
import { TicketStatus } from '../../../../domain/enums/ticket-status';

@Entity('support_tickets')
@Index('idx_support_tickets_user', ['userId', 'createdAt'])
@Index('idx_support_tickets_status', ['status', 'createdAt'])
export class SupportTicketOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'category', type: 'varchar', length: 20 })
  category: TicketCategory;

  @Column({ name: 'subject', type: 'varchar', length: 200 })
  subject: string;

  @Column({ name: 'body', type: 'text' })
  body: string;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status: TicketStatus;

  @Column({ name: 'condominium_id', type: 'uuid', nullable: true })
  condominiumId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
