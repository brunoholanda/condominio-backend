import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

import { ContactCategory } from '../../../../domain/enums/contact-category';

@Entity('useful_contacts')
export class UsefulContactOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index('idx_useful_contacts_condo')
  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId: string;

  @Column({ name: 'label', type: 'varchar', length: 150 })
  label: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'url', type: 'varchar', length: 500, nullable: true })
  url: string | null;

  @Column({ name: 'category', type: 'varchar', length: 20 })
  category: ContactCategory;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
