import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';

import type { PaginatedResult } from '../../../../../shared/application/paginated-result';
import { buildPaginatedResult } from '../../../../../shared/application/paginated-result';
import type { Charge } from '../../../domain/entities/charge';
import { ChargeStatus } from '../../../domain/enums/charge-status';
import type {
  ChargeQuery,
  ChargeSummary,
} from '../../../domain/repositories/charge.repository';
import { ChargeRepository } from '../../../domain/repositories/charge.repository';
import { ChargeMapper } from './charge.mapper';
import { ChargeOrmEntity } from './entities/charge.orm-entity';

@Injectable()
export class TypeormChargeRepository extends ChargeRepository {
  constructor(
    @InjectRepository(ChargeOrmEntity)
    private readonly repository: Repository<ChargeOrmEntity>,
  ) {
    super();
  }

  async save(charge: Charge): Promise<Charge> {
    await this.repository.save(ChargeMapper.toPersistence(charge));
    const saved = await this.findById(charge.id, charge.condominiumId);

    if (!saved) {
      throw new Error(`Falha ao persistir a cobrança ${charge.id}.`);
    }

    return saved;
  }

  async findById(id: string, condominiumId: string): Promise<Charge | null> {
    const row = await this.repository.findOne({ where: { id, condominiumId } });
    return row ? ChargeMapper.toDomain(row) : null;
  }

  async findByAsaasPaymentId(asaasPaymentId: string): Promise<Charge | null> {
    const row = await this.repository.findOne({ where: { asaasPaymentId } });
    return row ? ChargeMapper.toDomain(row) : null;
  }

  async findMany(query: ChargeQuery): Promise<PaginatedResult<Charge>> {
    const builder = this.createFilteredQuery(query)
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [rows, total] = await builder.getManyAndCount();

    return buildPaginatedResult(
      rows.map((row) => ChargeMapper.toDomain(row)),
      total,
      query,
    );
  }

  async summarize(condominiumId: string): Promise<ChargeSummary> {
    const rows = await this.repository
      .createQueryBuilder('charge')
      .select('charge.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(charge.amount_cents), 0)', 'amountCents')
      .where('charge.condominiumId = :condominiumId', { condominiumId })
      .groupBy('charge.status')
      .getRawMany<{ status: ChargeStatus; count: string; amountCents: string }>();

    const summary: ChargeSummary = {
      pendingCount: 0,
      paidCount: 0,
      cancelledCount: 0,
      pendingAmountCents: 0,
      paidAmountCents: 0,
    };

    for (const row of rows) {
      const count = Number(row.count);
      const amountCents = Number(row.amountCents);

      if (row.status === ChargeStatus.Pending) {
        summary.pendingCount = count;
        summary.pendingAmountCents = amountCents;
      } else if (row.status === ChargeStatus.Paid) {
        summary.paidCount = count;
        summary.paidAmountCents = amountCents;
      } else if (row.status === ChargeStatus.Cancelled) {
        summary.cancelledCount = count;
      }
    }

    return summary;
  }

  private createFilteredQuery(query: ChargeQuery): SelectQueryBuilder<ChargeOrmEntity> {
    const builder = this.repository
      .createQueryBuilder('charge')
      .where('charge.condominiumId = :condominiumId', { condominiumId: query.condominiumId })
      .orderBy('charge.dueDate', 'DESC')
      .addOrderBy('charge.unitNumber', 'ASC');

    if (query.status) {
      builder.andWhere('charge.status = :status', { status: query.status });
    }

    if (query.unitNumber) {
      builder.andWhere('charge.unitNumber = :unitNumber', { unitNumber: query.unitNumber.trim() });
    }

    if (query.batchId) {
      builder.andWhere('charge.batchId = :batchId', { batchId: query.batchId });
    }

    if (query.search) {
      builder.andWhere(
        '(charge.description ILIKE :term OR charge.unitNumber ILIKE :term OR charge.payerName ILIKE :term)',
        { term: `%${query.search}%` },
      );
    }

    return builder;
  }
}
