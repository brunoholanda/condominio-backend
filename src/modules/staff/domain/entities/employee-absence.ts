import { randomUUID } from 'node:crypto';

import {
  BusinessRuleError,
  InvalidFieldError,
} from '../../../../shared/domain/domain-error';
import { optionalText, requireDate, requireEnum, requireText } from '../../../../shared/domain/guards';
import { AbsenceReason, AbsenceStatus } from '../enums/staff.enums';

export interface EmployeeAbsenceProps {
  condominiumId: string;
  employeeId: string;
  reason: AbsenceReason | string;
  startDate: Date | string;
  endDate: Date | string;
  notes?: string | null;
  createdByUserId: string;
}

export interface EmployeeAbsenceSnapshot {
  id: string;
  condominiumId: string;
  employeeId: string;
  reason: AbsenceReason;
  startDate: Date;
  endDate: Date;
  notes: string | null;
  status: AbsenceStatus;
  attachmentStorageKey: string | null;
  reviewedByUserId: string | null;
  reviewedAt: Date | null;
  reviewNotes: string | null;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class EmployeeAbsence {
  private constructor(private readonly state: EmployeeAbsenceSnapshot) {}

  static create(props: EmployeeAbsenceProps): EmployeeAbsence {
    const now = new Date();
    const parsed = EmployeeAbsence.parse(props);

    return new EmployeeAbsence({
      ...parsed,
      id: randomUUID(),
      status: AbsenceStatus.Pending,
      attachmentStorageKey: null,
      reviewedByUserId: null,
      reviewedAt: null,
      reviewNotes: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(snapshot: EmployeeAbsenceSnapshot): EmployeeAbsence {
    return new EmployeeAbsence({
      ...snapshot,
      status: requireEnum('status', snapshot.status, AbsenceStatus),
      reason: requireEnum('motivo', snapshot.reason, AbsenceReason),
    });
  }

  withData(
    props: Omit<EmployeeAbsenceProps, 'condominiumId' | 'createdByUserId'>,
  ): EmployeeAbsence {
    if (this.state.status !== AbsenceStatus.Pending) {
      throw new BusinessRuleError('Só é possível editar justificativas pendentes.');
    }

    return new EmployeeAbsence({
      ...EmployeeAbsence.parse({
        ...props,
        condominiumId: this.state.condominiumId,
        createdByUserId: this.state.createdByUserId,
      }),
      id: this.state.id,
      status: this.state.status,
      attachmentStorageKey: this.state.attachmentStorageKey,
      reviewedByUserId: this.state.reviewedByUserId,
      reviewedAt: this.state.reviewedAt,
      reviewNotes: this.state.reviewNotes,
      createdByUserId: this.state.createdByUserId,
      createdAt: this.state.createdAt,
      updatedAt: new Date(),
    });
  }

  withAttachment(storageKey: string): EmployeeAbsence {
    return new EmployeeAbsence({
      ...this.state,
      attachmentStorageKey: requireText('anexo', storageKey, { min: 1, max: 500 }),
      updatedAt: new Date(),
    });
  }

  review(input: {
    status: AbsenceStatus.Approved | AbsenceStatus.Rejected | string;
    reviewedByUserId: string;
    reviewNotes?: string | null;
  }): EmployeeAbsence {
    if (this.state.status !== AbsenceStatus.Pending) {
      throw new BusinessRuleError('Esta justificativa já foi revisada.');
    }

    const status = requireEnum('status', input.status, AbsenceStatus);

    if (status === AbsenceStatus.Pending) {
      throw new InvalidFieldError('status', 'Informe APPROVED ou REJECTED.');
    }

    const now = new Date();

    return new EmployeeAbsence({
      ...this.state,
      status,
      reviewedByUserId: requireText('revisor', input.reviewedByUserId, {
        min: 36,
        max: 36,
      }),
      reviewedAt: now,
      reviewNotes: optionalText('notas da revisão', input.reviewNotes ?? null, {
        max: 1000,
      }),
      updatedAt: now,
    });
  }

  private static parse(
    props: EmployeeAbsenceProps,
  ): Pick<
    EmployeeAbsenceSnapshot,
    'condominiumId' | 'employeeId' | 'reason' | 'startDate' | 'endDate' | 'notes' | 'createdByUserId'
  > {
    const startDate = requireDate('data inicial', props.startDate);
    const endDate = requireDate('data final', props.endDate);

    if (endDate.getTime() < startDate.getTime()) {
      throw new InvalidFieldError(
        'data final',
        'A data final não pode ser anterior à data inicial.',
      );
    }

    return {
      condominiumId: requireText('condomínio', props.condominiumId, { min: 36, max: 36 }),
      employeeId: requireText('funcionário', props.employeeId, { min: 36, max: 36 }),
      reason: requireEnum('motivo', props.reason, AbsenceReason),
      startDate,
      endDate,
      notes: optionalText('observações', props.notes, { max: 1000 }),
      createdByUserId: requireText('responsável', props.createdByUserId, { min: 36, max: 36 }),
    };
  }

  get id(): string {
    return this.state.id;
  }

  get condominiumId(): string {
    return this.state.condominiumId;
  }

  get employeeId(): string {
    return this.state.employeeId;
  }

  get status(): AbsenceStatus {
    return this.state.status;
  }

  get attachmentStorageKey(): string | null {
    return this.state.attachmentStorageKey;
  }

  toSnapshot(): EmployeeAbsenceSnapshot {
    return { ...this.state };
  }
}
