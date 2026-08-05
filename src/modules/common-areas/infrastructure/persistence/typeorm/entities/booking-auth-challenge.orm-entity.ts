import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('booking_auth_challenges')
export class BookingAuthChallengeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_booking_auth_challenges_condo')
  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId: string;

  @Index('idx_booking_auth_challenges_resident')
  @Column({ name: 'resident_id', type: 'uuid' })
  residentId: string;

  @Column({ name: 'code_hash', type: 'varchar', length: 255 })
  codeHash: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'int', default: 0 })
  resends: number;

  @Column({ name: 'consumed_at', type: 'timestamptz', nullable: true })
  consumedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
