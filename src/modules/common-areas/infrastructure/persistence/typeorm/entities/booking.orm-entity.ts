import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { BookingStatus } from '../../../../domain/enums/booking-status';

@Entity('bookings')
export class BookingOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index('idx_bookings_area_period')
  @Column({ name: 'common_area_id', type: 'uuid' })
  commonAreaId: string;

  @Index('idx_bookings_condo')
  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId: string;

  @Column({ name: 'unit_number', type: 'varchar', length: 20 })
  unitNumber: string;

  @Index('idx_bookings_resident')
  @Column({ name: 'resident_id', type: 'uuid' })
  residentId: string;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt: Date;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt: Date;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'REQUESTED' })
  status: BookingStatus;

  @Column({ name: 'cost_snapshot_cents', type: 'int', default: 0 })
  costSnapshotCents: number;

  @Column({ name: 'rules_accepted_at', type: 'timestamptz' })
  rulesAcceptedAt: Date;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
