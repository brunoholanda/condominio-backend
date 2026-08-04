import { randomUUID } from 'node:crypto';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { requireDate, requireText } from '../../../../shared/domain/guards';

export interface ChargeBatchProps {
  condominiumId: string;
  referenceMonth: Date | string;
  description: string;
  dueDate: Date | string;
  defaultAmountCents: number;
  createdByUserId: string;
}

export interface ChargeBatchSnapshot extends ChargeBatchProps {
  id: string;
  referenceMonth: Date;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ChargeBatchState {
  id: string;
  condominiumId: string;
  referenceMonth: Date;
  description: string;
  dueDate: Date;
  defaultAmountCents: number;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Lote de geração de cobranças PIX para um mês de competência. */
export class ChargeBatch {
  private constructor(private readonly state: ChargeBatchState) {}

  static create(props: ChargeBatchProps): ChargeBatch {
    const now = new Date();

    return new ChargeBatch({
      ...ChargeBatch.parse(props),
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(snapshot: ChargeBatchSnapshot): ChargeBatch {
    return new ChargeBatch({
      ...ChargeBatch.parse(snapshot),
      id: snapshot.id,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  private static parse(
    props: ChargeBatchProps,
  ): Omit<ChargeBatchState, 'id' | 'createdAt' | 'updatedAt'> {
    const defaultAmountCents = Math.trunc(Number(props.defaultAmountCents));

    if (!Number.isFinite(defaultAmountCents) || defaultAmountCents <= 0) {
      throw new BusinessRuleError('O valor padrão do lote deve ser maior que zero.');
    }

    const referenceMonth = requireDate('competência', props.referenceMonth);
    referenceMonth.setUTCDate(1);
    referenceMonth.setUTCHours(0, 0, 0, 0);

    return {
      condominiumId: requireText('condomínio', props.condominiumId, { min: 1, max: 64 }),
      referenceMonth,
      description: requireText('descrição', props.description, { min: 3, max: 200 }),
      dueDate: requireDate('data de vencimento', props.dueDate),
      defaultAmountCents,
      createdByUserId: requireText('responsável', props.createdByUserId, { min: 1, max: 64 }),
    };
  }

  get id(): string {
    return this.state.id;
  }

  get condominiumId(): string {
    return this.state.condominiumId;
  }

  toSnapshot(): ChargeBatchSnapshot {
    return { ...this.state };
  }
}
