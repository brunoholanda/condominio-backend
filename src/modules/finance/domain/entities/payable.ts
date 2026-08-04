import { randomUUID } from 'node:crypto';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { optionalText, requireDate, requireText } from '../../../../shared/domain/guards';
import { PayableStatus } from '../enums/payable-status';

export interface PayableProps {
  condominiumId: string;
  description: string;
  vendor: string;
  category: string;
  amountCents: number;
  dueDate: Date | string;
  notes?: string | null;
  createdByUserId: string;
}

export interface PayableSnapshot extends PayableProps {
  id: string;
  dueDate: Date;
  notes: string | null;
  status: PayableStatus;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PayableState {
  id: string;
  condominiumId: string;
  description: string;
  vendor: string;
  category: string;
  amountCents: number;
  dueDate: Date;
  notes: string | null;
  status: PayableStatus;
  paidAt: Date | null;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

/** A bill the condo owes: to a vendor, for an amount, due by a date. */
export class Payable {
  private constructor(private readonly state: PayableState) {}

  static create(props: PayableProps): Payable {
    const now = new Date();

    return new Payable({
      ...Payable.parse(props),
      id: randomUUID(),
      status: PayableStatus.Pending,
      paidAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(snapshot: PayableSnapshot): Payable {
    return new Payable({
      ...Payable.parse(snapshot),
      id: snapshot.id,
      status: snapshot.status,
      paidAt: snapshot.paidAt,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  /** Only pending payables can have their data replaced. */
  withData(props: PayableProps): Payable {
    this.ensurePending('alterar os dados');

    return new Payable({
      ...Payable.parse(props),
      id: this.state.id,
      status: this.state.status,
      paidAt: this.state.paidAt,
      createdAt: this.state.createdAt,
      updatedAt: new Date(),
    });
  }

  markAsPaid(paidAt: Date = new Date()): Payable {
    this.ensurePending('marcar como paga');

    return new Payable({
      ...this.state,
      status: PayableStatus.Paid,
      paidAt,
      updatedAt: new Date(),
    });
  }

  cancel(): Payable {
    this.ensurePending('cancelar');

    return new Payable({
      ...this.state,
      status: PayableStatus.Cancelled,
      updatedAt: new Date(),
    });
  }

  private ensurePending(action: string): void {
    if (this.state.status !== PayableStatus.Pending) {
      throw new BusinessRuleError(
        `Só é possível ${action} de uma conta pendente. Esta já está ${Payable.statusLabel(this.state.status)}.`,
      );
    }
  }

  private static statusLabel(status: PayableStatus): string {
    return status === PayableStatus.Paid ? 'paga' : 'cancelada';
  }

  private static parse(
    props: PayableProps,
  ): Omit<PayableState, 'id' | 'status' | 'paidAt' | 'createdAt' | 'updatedAt'> {
    const amountCents = Math.trunc(Number(props.amountCents));

    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      throw new BusinessRuleError('O valor da conta deve ser maior que zero.');
    }

    return {
      condominiumId: requireText('condomínio', props.condominiumId, { min: 1, max: 64 }),
      description: requireText('descrição', props.description, { min: 3, max: 200 }),
      vendor: requireText('fornecedor', props.vendor, { min: 2, max: 150 }),
      category: requireText('categoria', props.category, { min: 2, max: 60 }),
      amountCents,
      dueDate: requireDate('data de vencimento', props.dueDate),
      notes: optionalText('observações', props.notes, { min: 1, max: 2000 }),
      createdByUserId: requireText('responsável', props.createdByUserId, { min: 1, max: 64 }),
    };
  }

  get id(): string {
    return this.state.id;
  }

  get condominiumId(): string {
    return this.state.condominiumId;
  }

  get status(): PayableStatus {
    return this.state.status;
  }

  get createdByUserId(): string {
    return this.state.createdByUserId;
  }

  toSnapshot(): PayableSnapshot {
    const { state } = this;

    return {
      id: state.id,
      condominiumId: state.condominiumId,
      description: state.description,
      vendor: state.vendor,
      category: state.category,
      amountCents: state.amountCents,
      dueDate: state.dueDate,
      notes: state.notes,
      status: state.status,
      paidAt: state.paidAt,
      createdByUserId: state.createdByUserId,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    };
  }
}
