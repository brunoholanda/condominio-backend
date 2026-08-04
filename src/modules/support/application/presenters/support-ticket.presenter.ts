import type { SupportTicket } from '../../domain/entities/support-ticket';
import type { SupportTicketResponseDto } from '../dto/support-ticket-response.dto';

export const SupportTicketPresenter = {
  toResponse(
    ticket: SupportTicket,
    author?: { name: string; email: string },
  ): SupportTicketResponseDto {
    const snapshot = ticket.toSnapshot();

    return {
      id: snapshot.id,
      userId: snapshot.userId,
      category: snapshot.category,
      subject: snapshot.subject,
      body: snapshot.body,
      status: snapshot.status,
      condominiumId: snapshot.condominiumId,
      createdAt: snapshot.createdAt.toISOString(),
      updatedAt: snapshot.updatedAt.toISOString(),
      ...(author
        ? {
            authorName: author.name,
            authorEmail: author.email,
          }
        : {}),
    };
  },
};
