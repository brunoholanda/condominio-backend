import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('condo_units')
@Index('idx_condo_units_condo_number', ['condominiumId', 'number'], { unique: true })
export class CondoUnitOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId: string;

  @Column({ name: 'number', type: 'varchar', length: 20 })
  number: string;

  /** When true, nobody lives there for now — unit leaves the pending registration list. */
  @Column({ name: 'is_vacant', type: 'boolean', default: false })
  isVacant: boolean;
}
