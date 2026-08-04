import { randomUUID } from 'node:crypto';

import { optionalText, requireText } from '../../../../shared/domain/guards';
import type { PayableStatus } from '../enums/payable-status';

export interface PayableStatusHistoryProps {
  payableId: string;
  fromStatus: PayableStatus | null;
  toStatus: PayableStatus;
  changedByUserId: string;
  note?: string | null;
}

export interface PayableStatusHistorySnapshot extends PayableStatusHistoryProps {
  id: string;
  note: string | null;
  changedAt: Date;
}

/** One entry of the audit trail of a payable's status changes. */
export class PayableStatusHistory {
  private constructor(private readonly state: PayableStatusHistorySnapshot) {}

  static create(props: PayableStatusHistoryProps): PayableStatusHistory {
    return new PayableStatusHistory({
      id: randomUUID(),
      payableId: requireText('conta', props.payableId, { min: 1, max: 64 }),
      fromStatus: props.fromStatus,
      toStatus: props.toStatus,
      changedByUserId: requireText('responsável', props.changedByUserId, { min: 1, max: 64 }),
      note: optionalText('observação', props.note, { min: 1, max: 2000 }),
      changedAt: new Date(),
    });
  }

  static restore(snapshot: PayableStatusHistorySnapshot): PayableStatusHistory {
    return new PayableStatusHistory({ ...snapshot });
  }

  toSnapshot(): PayableStatusHistorySnapshot {
    return { ...this.state };
  }
}
