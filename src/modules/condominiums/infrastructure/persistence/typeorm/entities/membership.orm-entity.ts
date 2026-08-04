import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

import { MembershipRole } from '../../../../domain/enums/membership-role';

@Entity('memberships')
@Index('idx_memberships_user_condo', ['userId', 'condominiumId'], { unique: true })
export class MembershipOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Index('idx_memberships_condo')
  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId: string;

  @Column({ name: 'role', type: 'varchar', length: 20 })
  role: MembershipRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
