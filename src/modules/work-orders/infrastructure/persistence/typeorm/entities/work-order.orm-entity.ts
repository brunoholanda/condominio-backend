import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  WorkOrderCategory,
  WorkOrderPriority,
  WorkOrderStatus,
} from '../../../../domain/enums/work-order.enums';

@Entity('condo_work_orders')
@Index('idx_condo_work_orders_condo', ['condominiumId', 'status', 'createdAt'])
export class WorkOrderOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId: string;

  @Column({ name: 'title', type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'description', type: 'varchar', length: 5000 })
  description: string;

  @Column({ name: 'category', type: 'varchar', length: 40 })
  category: WorkOrderCategory;

  @Column({ name: 'priority', type: 'varchar', length: 20, default: WorkOrderPriority.Normal })
  priority: WorkOrderPriority;

  @Column({ name: 'status', type: 'varchar', length: 20, default: WorkOrderStatus.Open })
  status: WorkOrderStatus;

  @Column({ name: 'unit_number', type: 'varchar', length: 40, nullable: true })
  unitNumber: string | null;

  @Column({ name: 'reporter_name', type: 'varchar', length: 150, nullable: true })
  reporterName: string | null;

  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId: string | null;

  @Column({ name: 'assigned_to', type: 'varchar', length: 150, nullable: true })
  assignedTo: string | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
