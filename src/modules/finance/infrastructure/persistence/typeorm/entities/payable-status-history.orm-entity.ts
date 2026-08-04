import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

import { PayableStatus } from '../../../../domain/enums/payable-status';

@Entity('payable_status_history')
export class PayableStatusHistoryOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index('idx_payable_status_history_payable')
  @Column({ name: 'payable_id', type: 'uuid' })
  payableId: string;

  @Column({ name: 'from_status', type: 'varchar', length: 20, nullable: true })
  fromStatus: PayableStatus | null;

  @Column({ name: 'to_status', type: 'varchar', length: 20 })
  toStatus: PayableStatus;

  @Column({ name: 'changed_by_user_id', type: 'uuid' })
  changedByUserId: string;

  @Column({ name: 'changed_at', type: 'timestamptz' })
  changedAt: Date;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string | null;
}
