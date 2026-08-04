import type { DeepPartial } from 'typeorm';

import { SupportTicket } from '../../../domain/entities/support-ticket';
import type { SupportTicketOrmEntity } from './entities/support-ticket.orm-entity';

export const SupportTicketMapper = {
  toDomain(row: SupportTicketOrmEntity): SupportTicket {
    return SupportTicket.restore({
      id: row.id,
      userId: row.userId,
      category: row.category,
      subject: row.subject,
      body: row.body,
      status: row.status,
      condominiumId: row.condominiumId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  },

  toPersistence(ticket: SupportTicket): DeepPartial<SupportTicketOrmEntity> {
    const snapshot = ticket.toSnapshot();

    return {
      id: snapshot.id,
      userId: snapshot.userId,
      category: snapshot.category,
      subject: snapshot.subject,
      body: snapshot.body,
      status: snapshot.status,
      condominiumId: snapshot.condominiumId,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  },
};
