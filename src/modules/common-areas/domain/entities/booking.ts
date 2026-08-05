import { randomUUID } from 'node:crypto';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import {
  optionalText,
  requireDate,
  requireText,
  requireTrue,
} from '../../../../shared/domain/guards';
import { BookingStatus } from '../enums/booking-status';

export interface BookingProps {
  commonAreaId: string;
  condominiumId: string;
  unitNumber: string;
  residentId: string;
  startsAt: Date | string;
  endsAt: Date | string;
  costSnapshotCents: number;
  acceptedRules: boolean;
  notes?: string | null;
}

export interface BookingSnapshot {
  id: string;
  commonAreaId: string;
  condominiumId: string;
  unitNumber: string;
  residentId: string;
  startsAt: Date;
  endsAt: Date;
  status: BookingStatus;
  costSnapshotCents: number;
  rulesAcceptedAt: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** A resident's request to use a common area during a time window. */
export class Booking {
  private constructor(private readonly state: BookingSnapshot) {}

  static create(props: BookingProps): Booking {
    const now = new Date();
    const parsed = Booking.parse(props);

    return new Booking({
      ...parsed,
      id: randomUUID(),
      status: BookingStatus.Requested,
      rulesAcceptedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(snapshot: BookingSnapshot): Booking {
    return new Booking(snapshot);
  }

  approve(): Booking {
    this.ensureStatus(BookingStatus.Requested, 'aprovar');

    return new Booking({ ...this.state, status: BookingStatus.Approved, updatedAt: new Date() });
  }

  reject(): Booking {
    this.ensureStatus(BookingStatus.Requested, 'recusar');

    return new Booking({ ...this.state, status: BookingStatus.Rejected, updatedAt: new Date() });
  }

  cancel(): Booking {
    if (this.state.status === BookingStatus.Cancelled) {
      throw new BusinessRuleError('Esta reserva já está cancelada.');
    }

    if (this.state.status === BookingStatus.Rejected) {
      throw new BusinessRuleError('Uma reserva recusada não pode ser cancelada.');
    }

    return new Booking({ ...this.state, status: BookingStatus.Cancelled, updatedAt: new Date() });
  }

  private ensureStatus(expected: BookingStatus, action: string): void {
    if (this.state.status !== expected) {
      throw new BusinessRuleError(`Só é possível ${action} uma reserva com solicitação pendente.`);
    }
  }

  private static parse(
    props: BookingProps,
  ): Omit<BookingSnapshot, 'id' | 'status' | 'rulesAcceptedAt' | 'createdAt' | 'updatedAt'> {
    const startsAt = requireDate('início da reserva', props.startsAt);
    const endsAt = requireDate('fim da reserva', props.endsAt);

    if (endsAt.getTime() <= startsAt.getTime()) {
      throw new BusinessRuleError('O fim da reserva deve ser depois do início.');
    }

    requireTrue(
      'aceite das regras',
      props.acceptedRules,
      'É necessário aceitar as regras da área para reservar.',
    );

    const costSnapshotCents = Math.trunc(Number(props.costSnapshotCents ?? 0));

    if (costSnapshotCents < 0) {
      throw new BusinessRuleError('O custo da reserva não pode ser negativo.');
    }

    return {
      commonAreaId: requireText('área comum', props.commonAreaId, { min: 1, max: 64 }),
      condominiumId: requireText('condomínio', props.condominiumId, { min: 1, max: 64 }),
      unitNumber: requireText('unidade', props.unitNumber, { min: 1, max: 20 }),
      residentId: requireText('morador', props.residentId, { min: 1, max: 64 }),
      startsAt,
      endsAt,
      costSnapshotCents,
      notes: optionalText('observações', props.notes, { min: 1, max: 2000 }),
    };
  }

  get id(): string {
    return this.state.id;
  }

  get status(): BookingStatus {
    return this.state.status;
  }

  get residentId(): string {
    return this.state.residentId;
  }

  get startsAt(): Date {
    return this.state.startsAt;
  }

  toSnapshot(): BookingSnapshot {
    return { ...this.state };
  }
}
