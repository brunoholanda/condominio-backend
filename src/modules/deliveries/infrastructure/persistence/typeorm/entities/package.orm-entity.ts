import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PackageStatus } from '../../../../domain/enums/package-status';

@Entity('packages')
@Index('idx_packages_condo_status', ['condominiumId', 'status'])
@Index('idx_packages_condo_unit', ['condominiumId', 'unitNumber'])
export class PackageOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId: string;

  @Column({ name: 'unit_number', type: 'varchar', length: 20 })
  unitNumber: string;

  @Column({ name: 'description', type: 'varchar', length: 200 })
  description: string;

  @Column({ name: 'carrier', type: 'varchar', length: 100, nullable: true })
  carrier: string | null;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status: PackageStatus;

  @Column({ name: 'received_at', type: 'timestamptz' })
  receivedAt: Date;

  @Column({ name: 'received_by_user_id', type: 'uuid', nullable: true })
  receivedByUserId: string | null;

  @Column({ name: 'received_by_employee_id', type: 'uuid', nullable: true })
  receivedByEmployeeId: string | null;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;

  @Column({ name: 'delivered_by_user_id', type: 'uuid', nullable: true })
  deliveredByUserId: string | null;

  @Column({ name: 'delivered_by_employee_id', type: 'uuid', nullable: true })
  deliveredByEmployeeId: string | null;

  @Column({ name: 'recipient_name', type: 'varchar', length: 150, nullable: true })
  recipientName: string | null;

  @Column({ name: 'signature', type: 'text', nullable: true })
  signature: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
