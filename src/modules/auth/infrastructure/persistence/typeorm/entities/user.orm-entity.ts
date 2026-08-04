import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 150 })
  name: string;

  @Index('idx_users_email', { unique: true })
  @Column({ name: 'email', type: 'varchar', length: 254 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  /** Nulo enquanto o operador não se identifica na área restrita. */
  @Index('idx_users_cpf', { unique: true })
  @Column({ name: 'cpf', type: 'varchar', length: 11, nullable: true })
  cpf: string | null;

  /** Papel global da plataforma (ex.: SYSTEM_OWNER). */
  @Column({ name: 'platform_role', type: 'varchar', length: 32, nullable: true })
  platformRole: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'plan', type: 'varchar', length: 16, default: 'lite' })
  plan: string;

  @Column({ name: 'subscription_status', type: 'varchar', length: 24, default: 'TRIALING' })
  subscriptionStatus: string;

  @Column({ name: 'trial_ends_at', type: 'timestamptz' })
  trialEndsAt: Date;

  @Column({ name: 'subscription_updated_at', type: 'timestamptz', nullable: true })
  subscriptionUpdatedAt: Date | null;

  @Column({ name: 'stripe_customer_id', type: 'varchar', length: 64, nullable: true })
  stripeCustomerId: string | null;

  @Column({ name: 'stripe_subscription_id', type: 'varchar', length: 64, nullable: true })
  stripeSubscriptionId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
