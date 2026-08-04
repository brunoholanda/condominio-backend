import { randomUUID } from 'node:crypto';

import { requireEnum, requireText } from '../../../../shared/domain/guards';
import { PunchStatus, PunchType } from '../enums/staff.enums';

export interface TimePunchProps {
  condominiumId: string;
  employeeId: string;
  type: PunchType | string;
  status: PunchStatus | string;
  punchedAt?: Date;
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  distanceMeters: number;
  selfieStorageKey?: string | null;
  deviceUserAgent?: string | null;
  rejectedReason?: string | null;
}

export interface TimePunchSnapshot {
  id: string;
  condominiumId: string;
  employeeId: string;
  type: PunchType;
  status: PunchStatus;
  punchedAt: Date;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  distanceMeters: number;
  selfieStorageKey: string | null;
  selfiePurgedAt: Date | null;
  deviceUserAgent: string | null;
  rejectedReason: string | null;
  createdAt: Date;
}

export class TimePunch {
  private constructor(private readonly state: TimePunchSnapshot) {}

  static create(props: TimePunchProps): TimePunch {
    const now = new Date();

    return new TimePunch({
      id: randomUUID(),
      condominiumId: requireText('condomínio', props.condominiumId, { min: 36, max: 36 }),
      employeeId: requireText('funcionário', props.employeeId, { min: 36, max: 36 }),
      type: requireEnum('tipo de marcação', props.type, PunchType),
      status: requireEnum('status', props.status, PunchStatus),
      punchedAt: props.punchedAt ?? now,
      latitude: props.latitude,
      longitude: props.longitude,
      accuracyMeters: props.accuracyMeters ?? null,
      distanceMeters: props.distanceMeters,
      selfieStorageKey: props.selfieStorageKey ?? null,
      selfiePurgedAt: null,
      deviceUserAgent: props.deviceUserAgent ? props.deviceUserAgent.slice(0, 500) : null,
      rejectedReason: props.rejectedReason ?? null,
      createdAt: now,
    });
  }

  static restore(snapshot: TimePunchSnapshot): TimePunch {
    return new TimePunch(snapshot);
  }

  withSelfiePurged(at: Date = new Date()): TimePunch {
    return new TimePunch({
      ...this.state,
      selfieStorageKey: null,
      selfiePurgedAt: at,
    });
  }

  get id(): string {
    return this.state.id;
  }

  get status(): PunchStatus {
    return this.state.status;
  }

  get type(): PunchType {
    return this.state.type;
  }

  get punchedAt(): Date {
    return this.state.punchedAt;
  }

  get selfieStorageKey(): string | null {
    return this.state.selfieStorageKey;
  }

  get selfiePurgedAt(): Date | null {
    return this.state.selfiePurgedAt;
  }

  toSnapshot(): TimePunchSnapshot {
    return { ...this.state };
  }
}
