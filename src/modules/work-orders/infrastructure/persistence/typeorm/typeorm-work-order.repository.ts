import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { WorkOrder } from '../../../domain/entities/work-order';
import {
  WorkOrderRepository,
  type WorkOrderFilters,
} from '../../../domain/repositories/work-order.repository';
import { WorkOrderOrmEntity } from './entities/work-order.orm-entity';
import { WorkOrderMapper } from './work-order.mapper';

@Injectable()
export class TypeormWorkOrderRepository extends WorkOrderRepository {
  constructor(
    @InjectRepository(WorkOrderOrmEntity)
    private readonly repository: Repository<WorkOrderOrmEntity>,
  ) {
    super();
  }

  async save(order: WorkOrder): Promise<WorkOrder> {
    await this.repository.save(WorkOrderMapper.toPersistence(order));
    const row = await this.repository.findOne({ where: { id: order.id } });

    if (!row) {
      throw new Error(`Falha ao persistir chamado ${order.id}.`);
    }

    return WorkOrderMapper.toDomain(row);
  }

  async findById(id: string, condominiumId: string): Promise<WorkOrder | null> {
    const row = await this.repository.findOne({ where: { id, condominiumId } });

    return row ? WorkOrderMapper.toDomain(row) : null;
  }

  async list(filters: WorkOrderFilters): Promise<WorkOrder[]> {
    const where: Record<string, unknown> = { condominiumId: filters.condominiumId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    const rows = await this.repository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 200,
    });

    return rows.map((row) => WorkOrderMapper.toDomain(row));
  }
}
