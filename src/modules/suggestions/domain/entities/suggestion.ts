import { randomUUID } from 'node:crypto';

import { requireEnum, requireText } from '../../../../shared/domain/guards';
import { SuggestionStatus } from '../enums/suggestion-status';

export interface SuggestionProps {
  condominiumId: string;
  unitNumber: string;
  residentId: string | null;
  authorName: string;
  body: string;
}

export interface SuggestionSnapshot {
  id: string;
  condominiumId: string;
  unitNumber: string;
  residentId: string | null;
  authorName: string;
  body: string;
  status: SuggestionStatus;
  createdAt: Date;
}

/** A respectful suggestion left by a validated resident of the condo. */
export class Suggestion {
  private constructor(private readonly state: SuggestionSnapshot) {}

  static create(props: SuggestionProps): Suggestion {
    return new Suggestion({
      id: randomUUID(),
      condominiumId: requireText('condomínio', props.condominiumId, { min: 1, max: 64 }),
      unitNumber: requireText('unidade', props.unitNumber, { min: 1, max: 20 }),
      residentId: props.residentId,
      authorName: requireText('autor', props.authorName, { min: 3, max: 150 }),
      body: requireText('sugestão', props.body, { min: 10, max: 4000 }),
      status: SuggestionStatus.New,
      createdAt: new Date(),
    });
  }

  static restore(snapshot: SuggestionSnapshot): Suggestion {
    return new Suggestion({
      ...snapshot,
      status: requireEnum('status', snapshot.status, SuggestionStatus),
    });
  }

  markAsRead(): Suggestion {
    return new Suggestion({ ...this.state, status: SuggestionStatus.Read });
  }

  get id(): string {
    return this.state.id;
  }

  get condominiumId(): string {
    return this.state.condominiumId;
  }

  get status(): SuggestionStatus {
    return this.state.status;
  }

  toSnapshot(): SuggestionSnapshot {
    return { ...this.state };
  }
}
