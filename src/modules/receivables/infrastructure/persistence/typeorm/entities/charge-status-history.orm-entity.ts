import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

import { ChargeStatus } from '../../../../domain/enums/charge-status';

@Entity('charge_status_history')
export class ChargeStatusHistoryOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index('idx_charge_status_history_charge')
  @Column({ name: 'charge_id', type: 'uuid' })
  chargeId: string;

  @Column({ name: 'from_status', type: 'varchar', length: 20, nullable: true })
  fromStatus: ChargeStatus | null;

  @Column({ name: 'to_status', type: 'varchar', length: 20 })
  toStatus: ChargeStatus;

  @Column({ name: 'changed_by_user_id', type: 'uuid', nullable: true })
  changedByUserId: string | null;

  @CreateDateColumn({ name: 'changed_at', type: 'timestamptz' })
  changedAt: Date;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string | null;
}
