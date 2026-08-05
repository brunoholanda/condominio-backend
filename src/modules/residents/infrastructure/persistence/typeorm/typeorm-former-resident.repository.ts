import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';

import { FormerResidentRecord } from '../../../domain/entities/former-resident';
import { FormerResidentRepository } from '../../../domain/repositories/former-resident.repository';
import { FormerResidentOrmEntity } from './entities/former-resident.orm-entity';
import { FormerResidentMapper } from './former-resident.mapper';

@Injectable()
export class TypeormFormerResidentRepository extends FormerResidentRepository {
  constructor(
    @InjectRepository(FormerResidentOrmEntity)
    private readonly rows: Repository<FormerResidentOrmEntity>,
  ) {
    super();
  }

  async save(record: FormerResidentRecord): Promise<FormerResidentRecord> {
    const saved = await this.rows.save(FormerResidentMapper.toOrm(record));

    return FormerResidentMapper.toDomain(saved);
  }

  async findManyByCondo(
    condominiumId: string,
    unit?: string,
  ): Promise<FormerResidentRecord[]> {
    const rows = await this.rows.find({
      where: unit ? { condominiumId, unit } : { condominiumId },
      order: { supersededAt: 'DESC' },
    });

    return rows.map((row) => FormerResidentMapper.toDomain(row));
  }

  async findById(
    id: string,
    condominiumId: string,
  ): Promise<FormerResidentRecord | null> {
    const row = await this.rows.findOne({ where: { id, condominiumId } });

    return row ? FormerResidentMapper.toDomain(row) : null;
  }

  async deleteExpired(before: Date): Promise<number> {
    const result = await this.rows.delete({ retainUntil: LessThan(before) });

    return result.affected ?? 0;
  }
}
