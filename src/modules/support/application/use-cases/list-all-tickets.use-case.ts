import { Injectable } from '@nestjs/common';

import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import type { TicketCategory } from '../../domain/enums/ticket-category';
import type { TicketStatus } from '../../domain/enums/ticket-status';
import { SupportTicketRepository } from '../../domain/repositories/support-ticket.repository';
import type { SupportTicketResponseDto } from '../dto/support-ticket-response.dto';
import { SupportTicketPresenter } from '../presenters/support-ticket.presenter';

@Injectable()
export class ListAllTicketsUseCase {
  constructor(
    private readonly tickets: SupportTicketRepository,
    private readonly users: UserRepository,
  ) {}

  async execute(filters?: {
    status?: TicketStatus;
    category?: TicketCategory;
  }): Promise<SupportTicketResponseDto[]> {
    const rows = await this.tickets.findAll(filters);
    const authors = new Map(
      (await this.users.findAll()).map((user) => {
        const snapshot = user.toSnapshot();

        return [snapshot.id, { name: snapshot.name, email: snapshot.email }] as const;
      }),
    );

    return rows.map((ticket) => {
      const author = authors.get(ticket.userId);

      return SupportTicketPresenter.toResponse(
        ticket,
        author ?? { name: 'Conta removida', email: '—' },
      );
    });
  }
}
