import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { PayableStatusHistory } from '../../../domain/entities/payable-status-history';
import { PayableStatusHistoryRepository } from '../../../domain/repositories/payable-status-history.repository';
import { PayableStatusHistoryOrmEntity } from './entities/payable-status-history.orm-entity';
import { PayableStatusHistoryMapper } from './payable-status-history.mapper';

@Injectable()
export class TypeormPayableStatusHistoryRepository extends PayableStatusHistoryRepository {
  constructor(
    @InjectRepository(PayableStatusHistoryOrmEntity)
    private readonly repository: Repository<PayableStatusHistoryOrmEntity>,
  ) {
    super();
  }

  async add(entry: PayableStatusHistory): Promise<PayableStatusHistory> {
    await this.repository.save(PayableStatusHistoryMapper.toPersistence(entry));

    return entry;
  }

  async listByPayable(payableId: string): Promise<PayableStatusHistory[]> {
    const rows = await this.repository.find({ where: { payableId }, order: { changedAt: 'ASC' } });

    return rows.map((row) => PayableStatusHistoryMapper.toDomain(row));
  }
}
