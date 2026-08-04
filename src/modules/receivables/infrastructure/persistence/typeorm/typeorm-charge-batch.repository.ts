import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { ChargeBatch } from '../../../domain/entities/charge-batch';
import { ChargeBatchRepository } from '../../../domain/repositories/charge-batch.repository';
import { ChargeBatchMapper } from './charge-batch.mapper';
import { ChargeBatchOrmEntity } from './entities/charge-batch.orm-entity';

@Injectable()
export class TypeormChargeBatchRepository extends ChargeBatchRepository {
  constructor(
    @InjectRepository(ChargeBatchOrmEntity)
    private readonly repository: Repository<ChargeBatchOrmEntity>,
  ) {
    super();
  }

  async save(batch: ChargeBatch): Promise<ChargeBatch> {
    await this.repository.save(ChargeBatchMapper.toPersistence(batch));
    const saved = await this.findById(batch.id, batch.condominiumId);

    if (!saved) {
      throw new Error(`Falha ao persistir o lote ${batch.id}.`);
    }

    return saved;
  }

  async findById(id: string, condominiumId: string): Promise<ChargeBatch | null> {
    const row = await this.repository.findOne({ where: { id, condominiumId } });
    return row ? ChargeBatchMapper.toDomain(row) : null;
  }
}
