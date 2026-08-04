import { Injectable } from '@nestjs/common';

import { SupportTicketRepository } from '../../domain/repositories/support-ticket.repository';
import type { SupportTicketResponseDto } from '../dto/support-ticket-response.dto';
import { SupportTicketPresenter } from '../presenters/support-ticket.presenter';

@Injectable()
export class ListMyTicketsUseCase {
  constructor(private readonly tickets: SupportTicketRepository) {}

  async execute(userId: string): Promise<SupportTicketResponseDto[]> {
    const rows = await this.tickets.findByUser(userId);

    return rows.map((ticket) => SupportTicketPresenter.toResponse(ticket));
  }
}
