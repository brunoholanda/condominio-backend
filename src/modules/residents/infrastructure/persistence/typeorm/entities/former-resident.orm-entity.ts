import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('former_residents')
@Index('idx_former_residents_condo_unit', ['condominiumId', 'unit'])
@Index('idx_former_residents_retain_until', ['retainUntil'])
export class FormerResidentOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId: string;

  @Column({ type: 'varchar', length: 30 })
  unit: string;

  @Column({ name: 'source_resident_id', type: 'uuid' })
  sourceResidentId: string;

  @Column({ type: 'varchar', length: 20 })
  reason: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ name: 'superseded_at', type: 'timestamptz' })
  supersededAt: Date;

  @Column({ name: 'retain_until', type: 'timestamptz' })
  retainUntil: Date;

  @Column({ name: 'superseded_by_user_id', type: 'uuid', nullable: true })
  supersededByUserId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
