import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('login_challenges')
export class LoginChallengeOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index('idx_login_challenges_user')
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  /** Hash do código; o valor digitado pelo usuário nunca é gravado. */
  @Column({ name: 'code_hash', type: 'varchar', length: 255 })
  codeHash: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'attempts', type: 'smallint', default: 0 })
  attempts: number;

  @Column({ name: 'resends', type: 'smallint', default: 0 })
  resends: number;

  @Column({ name: 'consumed_at', type: 'timestamptz', nullable: true })
  consumedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
