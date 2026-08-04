import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';

import type { PaginatedResult } from '../../../../../shared/application/paginated-result';
import { buildPaginatedResult } from '../../../../../shared/application/paginated-result';
import type { Payable } from '../../../domain/entities/payable';
import type { PayableQuery } from '../../../domain/repositories/payable.repository';
import { PayableRepository } from '../../../domain/repositories/payable.repository';
import { PayableOrmEntity } from './entities/payable.orm-entity';
import { PayableMapper } from './payable.mapper';

@Injectable()
export class TypeormPayableRepository extends PayableRepository {
  constructor(
    @InjectRepository(PayableOrmEntity)
    private readonly repository: Repository<PayableOrmEntity>,
  ) {
    super();
  }

  async save(payable: Payable): Promise<Payable> {
    await this.repository.save(PayableMapper.toPersistence(payable));

    const saved = await this.findById(payable.id, payable.condominiumId);

    if (!saved) {
      throw new Error(`Falha ao persistir a conta ${payable.id}.`);
    }

    return saved;
  }

  async findById(id: string, condominiumId: string): Promise<Payable | null> {
    const row = await this.repository.findOne({ where: { id, condominiumId } });

    return row ? PayableMapper.toDomain(row) : null;
  }

  async findMany(query: PayableQuery): Promise<PaginatedResult<Payable>> {
    const builder = this.createFilteredQuery(query)
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [rows, total] = await builder.getManyAndCount();

    return buildPaginatedResult(
      rows.map((row) => PayableMapper.toDomain(row)),
      total,
      query,
    );
  }

  private createFilteredQuery(query: PayableQuery): SelectQueryBuilder<PayableOrmEntity> {
    const builder = this.repository
      .createQueryBuilder('payable')
      .where('payable.condominiumId = :condominiumId', { condominiumId: query.condominiumId })
      .orderBy('payable.dueDate', 'ASC');

    if (query.status) {
      builder.andWhere('payable.status = :status', { status: query.status });
    }

    if (query.category) {
      builder.andWhere('payable.category = :category', { category: query.category });
    }

    if (query.search) {
      builder.andWhere('(payable.description ILIKE :term OR payable.vendor ILIKE :term)', {
        term: `%${query.search}%`,
      });
    }

    return builder;
  }
}
