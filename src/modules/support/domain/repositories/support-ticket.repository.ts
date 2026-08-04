import type { SupportTicket } from '../entities/support-ticket';
import type { TicketCategory } from '../enums/ticket-category';
import type { TicketStatus } from '../enums/ticket-status';

export abstract class SupportTicketRepository {
  abstract save(ticket: SupportTicket): Promise<SupportTicket>;

  abstract findById(id: string): Promise<SupportTicket | null>;

  abstract findByUser(userId: string): Promise<SupportTicket[]>;

  abstract findAll(filters?: {
    status?: TicketStatus;
    category?: TicketCategory;
  }): Promise<SupportTicket[]>;
}
