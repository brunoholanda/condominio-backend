import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { ChargeStatusHistory } from '../../../domain/entities/charge-status-history';
import { ChargeStatusHistoryRepository } from '../../../domain/repositories/charge-status-history.repository';
import { ChargeStatusHistoryMapper } from './charge-status-history.mapper';
import { ChargeStatusHistoryOrmEntity } from './entities/charge-status-history.orm-entity';

@Injectable()
export class TypeormChargeStatusHistoryRepository extends ChargeStatusHistoryRepository {
  constructor(
    @InjectRepository(ChargeStatusHistoryOrmEntity)
    private readonly repository: Repository<ChargeStatusHistoryOrmEntity>,
  ) {
    super();
  }

  async save(entry: ChargeStatusHistory): Promise<ChargeStatusHistory> {
    const row = await this.repository.save(ChargeStatusHistoryMapper.toPersistence(entry));
    return ChargeStatusHistoryMapper.toDomain(row as ChargeStatusHistoryOrmEntity);
  }
}
