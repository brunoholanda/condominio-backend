import { randomUUID } from 'node:crypto';

import { optionalText, requireText } from '../../../../shared/domain/guards';
import type { ChargeStatus } from '../enums/charge-status';

export interface ChargeStatusHistoryProps {
  chargeId: string;
  fromStatus: ChargeStatus | null;
  toStatus: ChargeStatus;
  changedByUserId?: string | null;
  note?: string | null;
}

export interface ChargeStatusHistorySnapshot extends ChargeStatusHistoryProps {
  id: string;
  changedByUserId: string | null;
  note: string | null;
  changedAt: Date;
}

/** Trilha de status de uma cobrança PIX. */
export class ChargeStatusHistory {
  private constructor(private readonly state: ChargeStatusHistorySnapshot) {}

  static create(props: ChargeStatusHistoryProps): ChargeStatusHistory {
    return new ChargeStatusHistory({
      id: randomUUID(),
      chargeId: requireText('cobrança', props.chargeId, { min: 1, max: 64 }),
      fromStatus: props.fromStatus,
      toStatus: props.toStatus,
      changedByUserId: optionalText('responsável', props.changedByUserId, { min: 1, max: 64 }),
      note: optionalText('observação', props.note, { min: 1, max: 2000 }),
      changedAt: new Date(),
    });
  }

  static restore(snapshot: ChargeStatusHistorySnapshot): ChargeStatusHistory {
    return new ChargeStatusHistory({ ...snapshot });
  }

  toSnapshot(): ChargeStatusHistorySnapshot {
    return { ...this.state };
  }
}
