import { randomUUID } from 'node:crypto';

import { optionalText, requireEnum, requireText } from '../../../../shared/domain/guards';
import { TicketCategory } from '../enums/ticket-category';
import { TicketStatus } from '../enums/ticket-status';

export interface SupportTicketProps {
  userId: string;
  category: TicketCategory;
  subject: string;
  body: string;
  condominiumId?: string | null;
}

export interface SupportTicketSnapshot {
  id: string;
  userId: string;
  category: TicketCategory;
  subject: string;
  body: string;
  status: TicketStatus;
  condominiumId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Chamado aberto por um usuário autenticado para o time da plataforma. */
export class SupportTicket {
  private constructor(private readonly state: SupportTicketSnapshot) {}

  static create(props: SupportTicketProps): SupportTicket {
    const now = new Date();

    return new SupportTicket({
      id: randomUUID(),
      userId: requireText('usuário', props.userId, { min: 1, max: 64 }),
      category: requireEnum('categoria', props.category, TicketCategory),
      subject: requireText('assunto', props.subject, { min: 5, max: 200 }),
      body: requireText('descrição', props.body, { min: 10, max: 5000 }),
      status: TicketStatus.Open,
      condominiumId: optionalText('condomínio', props.condominiumId ?? null, { min: 1, max: 64 }),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(snapshot: SupportTicketSnapshot): SupportTicket {
    return new SupportTicket({
      ...snapshot,
      category: requireEnum('categoria', snapshot.category, TicketCategory),
      status: requireEnum('status', snapshot.status, TicketStatus),
    });
  }

  withStatus(status: TicketStatus): SupportTicket {
    return new SupportTicket({
      ...this.state,
      status: requireEnum('status', status, TicketStatus),
      updatedAt: new Date(),
    });
  }

  get id(): string {
    return this.state.id;
  }

  get userId(): string {
    return this.state.userId;
  }

  get status(): TicketStatus {
    return this.state.status;
  }

  toSnapshot(): SupportTicketSnapshot {
    return { ...this.state };
  }
}
