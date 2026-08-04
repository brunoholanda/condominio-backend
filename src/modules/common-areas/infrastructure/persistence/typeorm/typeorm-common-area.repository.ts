import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { CommonArea } from '../../../domain/entities/common-area';
import { CommonAreaRepository } from '../../../domain/repositories/common-area.repository';
import { CommonAreaOrmEntity } from './entities/common-area.orm-entity';
import { CommonAreaMapper } from './common-area.mapper';

@Injectable()
export class TypeormCommonAreaRepository extends CommonAreaRepository {
  constructor(
    @InjectRepository(CommonAreaOrmEntity)
    private readonly repository: Repository<CommonAreaOrmEntity>,
  ) {
    super();
  }

  async save(area: CommonArea): Promise<CommonArea> {
    await this.repository.save(CommonAreaMapper.toPersistence(area));

    const saved = await this.findById(area.id, area.toSnapshot().condominiumId);

    if (!saved) {
      throw new Error(`Falha ao persistir a área comum ${area.id}.`);
    }

    return saved;
  }

  async findById(id: string, condominiumId: string): Promise<CommonArea | null> {
    const row = await this.repository.findOne({ where: { id, condominiumId } });

    return row ? CommonAreaMapper.toDomain(row) : null;
  }

  async findManyByCondo(condominiumId: string, onlyActive?: boolean): Promise<CommonArea[]> {
    const rows = await this.repository.find({
      where: onlyActive ? { condominiumId, active: true } : { condominiumId },
      order: { name: 'ASC' },
    });

    return rows.map((row) => CommonAreaMapper.toDomain(row));
  }

  async delete(id: string, condominiumId: string): Promise<void> {
    await this.repository.delete({ id, condominiumId });
  }
}
