import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { VisitorPassStatus } from '../../../../domain/enums/visitor-pass-status';

@Entity('visitor_passes')
@Index('idx_visitor_passes_condo', ['condominiumId', 'expectedAt'])
export class VisitorPassOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId: string;

  @Column({ name: 'visitor_name', type: 'varchar', length: 150 })
  visitorName: string;

  @Column({ name: 'visitor_document', type: 'varchar', length: 40, nullable: true })
  visitorDocument: string | null;

  @Column({ name: 'host_name', type: 'varchar', length: 150 })
  hostName: string;

  @Column({ name: 'unit_number', type: 'varchar', length: 40, nullable: true })
  unitNumber: string | null;

  @Column({ name: 'expected_at', type: 'timestamptz' })
  expectedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'status', type: 'varchar', length: 20, default: VisitorPassStatus.Pending })
  status: VisitorPassStatus;

  @Column({ name: 'notes', type: 'varchar', length: 1000, nullable: true })
  notes: string | null;

  @Column({ name: 'created_by_user_id', type: 'uuid', nullable: true })
  createdByUserId: string | null;

  @Column({ name: 'created_by_employee_id', type: 'uuid', nullable: true })
  createdByEmployeeId: string | null;

  @Column({ name: 'checked_in_at', type: 'timestamptz', nullable: true })
  checkedInAt: Date | null;

  @Column({ name: 'checked_in_by_user_id', type: 'uuid', nullable: true })
  checkedInByUserId: string | null;

  @Column({ name: 'checked_in_by_employee_id', type: 'uuid', nullable: true })
  checkedInByEmployeeId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
