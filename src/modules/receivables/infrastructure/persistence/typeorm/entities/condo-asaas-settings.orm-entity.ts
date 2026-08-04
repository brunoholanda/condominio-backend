import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('condo_asaas_settings')
export class CondoAsaasSettingsOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'condominium_id', type: 'uuid', unique: true })
  condominiumId: string;

  @Column({ name: 'api_key', type: 'text' })
  apiKey: string;

  @Column({ name: 'wallet_id', type: 'varchar', length: 64, nullable: true })
  walletId: string | null;

  @Column({ name: 'enabled', type: 'boolean', default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
