import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('common_areas')
export class CommonAreaOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index('idx_common_areas_condo')
  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId: string;

  @Column({ name: 'name', type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'rules', type: 'text', nullable: true })
  rules: string | null;

  @Column({ name: 'cost_cents', type: 'int', default: 0 })
  costCents: number;

  @Column({ name: 'capacity', type: 'int', default: 1 })
  capacity: number;

  @Column({ name: 'active', type: 'boolean', default: true })
  active: boolean;

  @Column({ name: 'auto_approve', type: 'boolean', default: false })
  autoApprove: boolean;

  @Column({ name: 'min_advance_hours', type: 'int', default: 0 })
  minAdvanceHours: number;

  @Column({ name: 'cancel_before_hours', type: 'int', default: 0 })
  cancelBeforeHours: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
