import { randomUUID } from 'node:crypto';

import type { ResidentSnapshot } from './resident';

export type FormerResidentReason = 'UPDATE' | 'DELETE';

export interface FormerResidentProps {
  condominiumId: string;
  unit: string;
  sourceResidentId: string;
  reason: FormerResidentReason;
  payload: ResidentSnapshot;
  supersededAt?: Date;
  retainUntil: Date;
  supersededByUserId?: string | null;
}

export interface FormerResidentState {
  id: string;
  condominiumId: string;
  unit: string;
  sourceResidentId: string;
  reason: FormerResidentReason;
  payload: ResidentSnapshot;
  supersededAt: Date;
  retainUntil: Date;
  supersededByUserId: string | null;
  createdAt: Date;
}

/** Cadastro de morador arquivado após substituição ou exclusão (retenção LGPD). */
export class FormerResidentRecord {
  private constructor(private readonly state: FormerResidentState) {}

  static create(props: FormerResidentProps): FormerResidentRecord {
    const now = new Date();

    return new FormerResidentRecord({
      id: randomUUID(),
      condominiumId: props.condominiumId,
      unit: props.unit,
      sourceResidentId: props.sourceResidentId,
      reason: props.reason,
      payload: props.payload,
      supersededAt: props.supersededAt ?? now,
      retainUntil: props.retainUntil,
      supersededByUserId: props.supersededByUserId ?? null,
      createdAt: now,
    });
  }

  static rehydrate(state: FormerResidentState): FormerResidentRecord {
    return new FormerResidentRecord(state);
  }

  get id(): string {
    return this.state.id;
  }

  get condominiumId(): string {
    return this.state.condominiumId;
  }

  get unit(): string {
    return this.state.unit;
  }

  get sourceResidentId(): string {
    return this.state.sourceResidentId;
  }

  get reason(): FormerResidentReason {
    return this.state.reason;
  }

  get payload(): ResidentSnapshot {
    return this.state.payload;
  }

  get supersededAt(): Date {
    return this.state.supersededAt;
  }

  get retainUntil(): Date {
    return this.state.retainUntil;
  }

  get supersededByUserId(): string | null {
    return this.state.supersededByUserId;
  }

  get createdAt(): Date {
    return this.state.createdAt;
  }

  toState(): FormerResidentState {
    return { ...this.state, payload: { ...this.state.payload } };
  }
}
