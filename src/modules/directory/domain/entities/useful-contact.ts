import { randomUUID } from 'node:crypto';

import { optionalText, requireEnum, requireText } from '../../../../shared/domain/guards';
import { ContactCategory } from '../enums/contact-category';

export interface UsefulContactProps {
  condominiumId: string;
  label: string;
  phone?: string | null;
  url?: string | null;
  category: ContactCategory | string;
  sortOrder?: number;
}

export interface UsefulContactSnapshot {
  id: string;
  condominiumId: string;
  label: string;
  phone: string | null;
  url: string | null;
  category: ContactCategory;
  sortOrder: number;
  createdAt: Date;
}

/** A quick-reference contact shown on the condo's public directory (e.g. doorman, syndic). */
export class UsefulContact {
  private constructor(private readonly state: UsefulContactSnapshot) {}

  static create(props: UsefulContactProps): UsefulContact {
    return new UsefulContact({
      ...UsefulContact.parse(props),
      id: randomUUID(),
      createdAt: new Date(),
    });
  }

  static restore(snapshot: UsefulContactSnapshot): UsefulContact {
    return new UsefulContact({
      ...UsefulContact.parse(snapshot),
      id: snapshot.id,
      createdAt: snapshot.createdAt,
    });
  }

  withData(props: UsefulContactProps): UsefulContact {
    return new UsefulContact({
      ...UsefulContact.parse(props),
      id: this.state.id,
      createdAt: this.state.createdAt,
    });
  }

  private static parse(props: UsefulContactProps): Omit<UsefulContactSnapshot, 'id' | 'createdAt'> {
    return {
      condominiumId: requireText('condomínio', props.condominiumId, { min: 1, max: 64 }),
      label: requireText('nome do contato', props.label, { min: 2, max: 150 }),
      phone: optionalText('telefone', props.phone, { min: 1, max: 20 }),
      url: optionalText('link', props.url, { min: 1, max: 500 }),
      category: requireEnum('categoria', props.category, ContactCategory),
      sortOrder: Number.isFinite(props.sortOrder) ? Number(props.sortOrder) : 0,
    };
  }

  get id(): string {
    return this.state.id;
  }

  toSnapshot(): UsefulContactSnapshot {
    return { ...this.state };
  }
}
