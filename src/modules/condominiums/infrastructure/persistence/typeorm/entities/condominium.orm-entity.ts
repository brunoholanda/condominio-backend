import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('condominiums')
export class CondominiumOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 150 })
  name: string;

  @Index('idx_condominiums_slug', { unique: true })
  @Column({ name: 'slug', type: 'varchar', length: 80 })
  slug: string;

  @Column({ name: 'building_handover_date', type: 'date', nullable: true })
  buildingHandoverDate: string | null;

  /** Quais atalhos de serviço aparecem no hub público `/c/:slug`. */
  @Column({
    name: 'public_hub_links',
    type: 'jsonb',
    default: () => `'["cadastro","documentos","transparencia","sugestoes","reservas"]'`,
  })
  publicHubLinks: string[];

  @Column({ name: 'address', type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ name: 'latitude', type: 'numeric', precision: 10, scale: 7, nullable: true })
  latitude: string | null;

  @Column({ name: 'longitude', type: 'numeric', precision: 10, scale: 7, nullable: true })
  longitude: string | null;

  @Column({ name: 'geofence_radius_meters', type: 'int', nullable: true })
  geofenceRadiusMeters: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
