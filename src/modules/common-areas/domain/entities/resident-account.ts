import { randomUUID } from 'node:crypto';

import { requireText } from '../../../../shared/domain/guards';

export interface ResidentAccountProps {
  userId: string;
  condominiumId: string;
  unitNumber: string;
}

export interface ResidentAccountSnapshot extends ResidentAccountProps {
  id: string;
  createdAt: Date;
}

/** Self-service access of a resident to a single unit inside a condo. */
export class ResidentAccount {
  private constructor(private readonly state: ResidentAccountSnapshot) {}

  static create(props: ResidentAccountProps): ResidentAccount {
    return new ResidentAccount({
      ...ResidentAccount.parse(props),
      id: randomUUID(),
      createdAt: new Date(),
    });
  }

  static restore(snapshot: ResidentAccountSnapshot): ResidentAccount {
    return new ResidentAccount({
      ...ResidentAccount.parse(snapshot),
      id: snapshot.id,
      createdAt: snapshot.createdAt,
    });
  }

  private static parse(
    props: ResidentAccountProps,
  ): Omit<ResidentAccountSnapshot, 'id' | 'createdAt'> {
    return {
      userId: requireText('usuário', props.userId, { min: 1, max: 64 }),
      condominiumId: requireText('condomínio', props.condominiumId, { min: 1, max: 64 }),
      unitNumber: requireText('unidade', props.unitNumber, { min: 1, max: 20 }),
    };
  }

  get id(): string {
    return this.state.id;
  }

  get userId(): string {
    return this.state.userId;
  }

  get unitNumber(): string {
    return this.state.unitNumber;
  }

  toSnapshot(): ResidentAccountSnapshot {
    return { ...this.state };
  }
}
