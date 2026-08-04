import { randomUUID } from 'node:crypto';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { optionalText, requireText } from '../../../../shared/domain/guards';

export interface CommonAreaProps {
  condominiumId: string;
  name: string;
  description?: string | null;
  rules?: string | null;
  costCents?: number;
  capacity?: number;
  active?: boolean;
  autoApprove?: boolean;
  minAdvanceHours?: number;
  cancelBeforeHours?: number;
}

export interface CommonAreaSnapshot {
  id: string;
  condominiumId: string;
  name: string;
  description: string | null;
  rules: string | null;
  costCents: number;
  capacity: number;
  active: boolean;
  autoApprove: boolean;
  minAdvanceHours: number;
  cancelBeforeHours: number;
  createdAt: Date;
  updatedAt: Date;
}

/** A shared amenity of the condo (party room, grill, gym...) that units can book. */
export class CommonArea {
  private constructor(private readonly state: CommonAreaSnapshot) {}

  static create(props: CommonAreaProps): CommonArea {
    const now = new Date();

    return new CommonArea({
      ...CommonArea.parse(props),
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(snapshot: CommonAreaSnapshot): CommonArea {
    return new CommonArea({
      ...CommonArea.parse(snapshot),
      id: snapshot.id,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  withData(props: CommonAreaProps): CommonArea {
    return new CommonArea({
      ...CommonArea.parse(props),
      id: this.state.id,
      createdAt: this.state.createdAt,
      updatedAt: new Date(),
    });
  }

  private static parse(
    props: CommonAreaProps,
  ): Omit<CommonAreaSnapshot, 'id' | 'createdAt' | 'updatedAt'> {
    const costCents = Math.trunc(Number(props.costCents ?? 0));
    const capacity = Math.trunc(Number(props.capacity ?? 1));
    const minAdvanceHours = Math.trunc(Number(props.minAdvanceHours ?? 0));
    const cancelBeforeHours = Math.trunc(Number(props.cancelBeforeHours ?? 0));

    if (costCents < 0) {
      throw new BusinessRuleError('O custo da área não pode ser negativo.');
    }

    if (!Number.isFinite(capacity) || capacity < 1) {
      throw new BusinessRuleError('A capacidade da área deve ser de ao menos 1 pessoa/grupo.');
    }

    if (minAdvanceHours < 0 || cancelBeforeHours < 0) {
      throw new BusinessRuleError('Os prazos da área não podem ser negativos.');
    }

    return {
      condominiumId: requireText('condomínio', props.condominiumId, { min: 1, max: 64 }),
      name: requireText('nome', props.name, { min: 2, max: 150 }),
      description: optionalText('descrição', props.description, { min: 1, max: 2000 }),
      rules: optionalText('regras', props.rules, { min: 1, max: 4000 }),
      costCents,
      capacity,
      active: props.active ?? true,
      autoApprove: props.autoApprove ?? false,
      minAdvanceHours,
      cancelBeforeHours,
    };
  }

  get id(): string {
    return this.state.id;
  }

  get active(): boolean {
    return this.state.active;
  }

  get autoApprove(): boolean {
    return this.state.autoApprove;
  }

  get costCents(): number {
    return this.state.costCents;
  }

  get minAdvanceHours(): number {
    return this.state.minAdvanceHours;
  }

  get cancelBeforeHours(): number {
    return this.state.cancelBeforeHours;
  }

  toSnapshot(): CommonAreaSnapshot {
    return { ...this.state };
  }
}
