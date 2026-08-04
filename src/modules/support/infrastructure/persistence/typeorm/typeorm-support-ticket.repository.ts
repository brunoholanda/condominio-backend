import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SupportTicket } from '../../../domain/entities/support-ticket';
import type { TicketCategory } from '../../../domain/enums/ticket-category';
import type { TicketStatus } from '../../../domain/enums/ticket-status';
import { SupportTicketRepository } from '../../../domain/repositories/support-ticket.repository';
import { SupportTicketOrmEntity } from './entities/support-ticket.orm-entity';
import { SupportTicketMapper } from './support-ticket.mapper';

@Injectable()
export class TypeormSupportTicketRepository extends SupportTicketRepository {
  constructor(
    @InjectRepository(SupportTicketOrmEntity)
    private readonly repository: Repository<SupportTicketOrmEntity>,
  ) {
    super();
  }

  async save(ticket: SupportTicket): Promise<SupportTicket> {
    await this.repository.save(SupportTicketMapper.toPersistence(ticket));

    const row = await this.repository.findOne({ where: { id: ticket.id } });

    if (!row) {
      throw new Error(`Falha ao persistir o chamado ${ticket.id}.`);
    }

    return SupportTicketMapper.toDomain(row);
  }

  async findById(id: string): Promise<SupportTicket | null> {
    const row = await this.repository.findOne({ where: { id } });

    return row ? SupportTicketMapper.toDomain(row) : null;
  }

  async findByUser(userId: string): Promise<SupportTicket[]> {
    const rows = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return rows.map((row) => SupportTicketMapper.toDomain(row));
  }

  async findAll(filters?: {
    status?: TicketStatus;
    category?: TicketCategory;
  }): Promise<SupportTicket[]> {
    const where: { status?: TicketStatus; category?: TicketCategory } = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    const rows = await this.repository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    return rows.map((row) => SupportTicketMapper.toDomain(row));
  }
}
