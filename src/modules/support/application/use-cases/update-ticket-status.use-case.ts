import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import type { TicketStatus } from '../../domain/enums/ticket-status';
import { SupportTicketRepository } from '../../domain/repositories/support-ticket.repository';
import type { SupportTicketResponseDto } from '../dto/support-ticket-response.dto';
import { SupportTicketPresenter } from '../presenters/support-ticket.presenter';

@Injectable()
export class UpdateTicketStatusUseCase {
  constructor(
    private readonly tickets: SupportTicketRepository,
    private readonly users: UserRepository,
  ) {}

  async execute(ticketId: string, status: TicketStatus): Promise<SupportTicketResponseDto> {
    const current = await this.tickets.findById(ticketId);

    if (!current) {
      throw new ResourceNotFoundError('Chamado não encontrado.');
    }

    const updated = await this.tickets.save(current.withStatus(status));
    const author = await this.users.findById(updated.userId);
    const authorSnapshot = author?.toSnapshot();

    return SupportTicketPresenter.toResponse(
      updated,
      authorSnapshot
        ? { name: authorSnapshot.name, email: authorSnapshot.email }
        : { name: 'Conta removida', email: '—' },
    );
  }
}
