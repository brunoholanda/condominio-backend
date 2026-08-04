import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('time_punches')
@Index('idx_time_punches_employee_day', ['employeeId', 'punchedAt'])
@Index('idx_time_punches_condo_day', ['condominiumId', 'punchedAt'])
export class TimePunchOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId: string;

  @Column({ name: 'employee_id', type: 'uuid' })
  employeeId: string;

  @Column({ name: 'type', type: 'varchar', length: 20 })
  type: string;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status: string;

  @Column({ name: 'punched_at', type: 'timestamptz' })
  punchedAt: Date;

  @Column({ name: 'latitude', type: 'numeric', precision: 10, scale: 7 })
  latitude: string;

  @Column({ name: 'longitude', type: 'numeric', precision: 10, scale: 7 })
  longitude: string;

  @Column({ name: 'accuracy_meters', type: 'numeric', precision: 10, scale: 2, nullable: true })
  accuracyMeters: string | null;

  @Column({ name: 'distance_meters', type: 'numeric', precision: 10, scale: 2 })
  distanceMeters: string;

  @Column({ name: 'selfie_storage_key', type: 'varchar', length: 500, nullable: true })
  selfieStorageKey: string | null;

  @Column({ name: 'selfie_purged_at', type: 'timestamptz', nullable: true })
  selfiePurgedAt: Date | null;

  @Column({ name: 'device_user_agent', type: 'varchar', length: 500, nullable: true })
  deviceUserAgent: string | null;

  @Column({ name: 'rejected_reason', type: 'varchar', length: 255, nullable: true })
  rejectedReason: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
