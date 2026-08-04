import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

import { SuggestionStatus } from '../../../../domain/enums/suggestion-status';

@Entity('suggestions')
@Index('idx_suggestions_condo_status', ['condominiumId', 'status', 'createdAt'])
export class SuggestionOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId: string;

  @Column({ name: 'unit_number', type: 'varchar', length: 20 })
  unitNumber: string;

  @Column({ name: 'resident_id', type: 'uuid', nullable: true })
  residentId: string | null;

  @Column({ name: 'author_name', type: 'varchar', length: 150 })
  authorName: string;

  @Column({ name: 'body', type: 'text' })
  body: string;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status: SuggestionStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
