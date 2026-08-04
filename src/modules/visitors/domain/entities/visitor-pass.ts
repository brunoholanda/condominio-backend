import { randomUUID } from 'node:crypto';

import {
  BusinessRuleError,
  InvalidFieldError,
} from '../../../../shared/domain/domain-error';
import { optionalText, requireDate, requireEnum, requireText } from '../../../../shared/domain/guards';
import { VisitorPassStatus } from '../enums/visitor-pass-status';

export interface VisitorPassProps {
  condominiumId: string;
  visitorName: string;
  visitorDocument?: string | null;
  hostName: string;
  unitNumber?: string | null;
  expectedAt: Date | string;
  expiresAt: Date | string;
  notes?: string | null;
  createdByUserId: string;
}

export interface VisitorPassSnapshot {
  id: string;
  condominiumId: string;
  visitorName: string;
  visitorDocument: string | null;
  hostName: string;
  unitNumber: string | null;
  expectedAt: Date;
  expiresAt: Date;
  status: VisitorPassStatus;
  notes: string | null;
  createdByUserId: string;
  checkedInAt: Date | null;
  checkedInByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class VisitorPass {
  private constructor(private readonly state: VisitorPassSnapshot) {}

  static create(props: VisitorPassProps): VisitorPass {
    const now = new Date();
    const expectedAt = requireDate('previsão de chegada', props.expectedAt);
    const expiresAt = requireDate('validade', props.expiresAt);

    if (expiresAt.getTime() < expectedAt.getTime()) {
      throw new InvalidFieldError(
        'validade',
        'A validade não pode ser anterior à previsão de chegada.',
      );
    }

    return new VisitorPass({
      id: randomUUID(),
      condominiumId: requireText('condomínio', props.condominiumId, { min: 36, max: 36 }),
      visitorName: requireText('visitante', props.visitorName, { min: 2, max: 150 }),
      visitorDocument: optionalText('documento', props.visitorDocument ?? null, { max: 40 }),
      hostName: requireText('anfitrião', props.hostName, { min: 2, max: 150 }),
      unitNumber: optionalText('unidade', props.unitNumber ?? null, { max: 40 }),
      expectedAt,
      expiresAt,
      status: VisitorPassStatus.Pending,
      notes: optionalText('observações', props.notes ?? null, { max: 1000 }),
      createdByUserId: requireText('criador', props.createdByUserId, { min: 36, max: 36 }),
      checkedInAt: null,
      checkedInByUserId: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(snapshot: VisitorPassSnapshot): VisitorPass {
    return new VisitorPass({
      ...snapshot,
      status: requireEnum('status', snapshot.status, VisitorPassStatus),
    });
  }

  checkIn(checkedInByUserId: string, at: Date = new Date()): VisitorPass {
    this.assertPending();

    if (this.state.expiresAt.getTime() < at.getTime()) {
      throw new BusinessRuleError('Este passe de visitante já expirou.');
    }

    return new VisitorPass({
      ...this.state,
      status: VisitorPassStatus.CheckedIn,
      checkedInAt: at,
      checkedInByUserId: requireText('responsável', checkedInByUserId, { min: 36, max: 36 }),
      updatedAt: at,
    });
  }

  cancel(at: Date = new Date()): VisitorPass {
    this.assertPending();

    return new VisitorPass({
      ...this.state,
      status: VisitorPassStatus.Cancelled,
      updatedAt: at,
    });
  }

  private assertPending(): void {
    if (this.state.status !== VisitorPassStatus.Pending) {
      throw new BusinessRuleError(
        `Não é possível alterar um passe com status ${this.state.status}.`,
      );
    }
  }

  get id(): string {
    return this.state.id;
  }

  get condominiumId(): string {
    return this.state.condominiumId;
  }

  get status(): VisitorPassStatus {
    return this.state.status;
  }

  toSnapshot(): VisitorPassSnapshot {
    return { ...this.state };
  }
}
