import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

import { VisitorPass } from '../../../domain/entities/visitor-pass';
import {
  VisitorPassRepository,
  type VisitorPassFilters,
} from '../../../domain/repositories/visitor-pass.repository';
import { VisitorPassOrmEntity } from './entities/visitor-pass.orm-entity';
import { VisitorPassMapper } from './visitor-pass.mapper';

@Injectable()
export class TypeormVisitorPassRepository extends VisitorPassRepository {
  constructor(
    @InjectRepository(VisitorPassOrmEntity)
    private readonly repository: Repository<VisitorPassOrmEntity>,
  ) {
    super();
  }

  async save(pass: VisitorPass): Promise<VisitorPass> {
    await this.repository.save(VisitorPassMapper.toPersistence(pass));
    const row = await this.repository.findOne({ where: { id: pass.id } });

    if (!row) {
      throw new Error(`Falha ao persistir passe ${pass.id}.`);
    }

    return VisitorPassMapper.toDomain(row);
  }

  async findById(id: string, condominiumId: string): Promise<VisitorPass | null> {
    const row = await this.repository.findOne({ where: { id, condominiumId } });

    return row ? VisitorPassMapper.toDomain(row) : null;
  }

  async list(filters: VisitorPassFilters): Promise<VisitorPass[]> {
    const where: Record<string, unknown> = { condominiumId: filters.condominiumId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.from && filters.to) {
      where.expectedAt = Between(filters.from, filters.to);
    } else if (filters.from) {
      where.expectedAt = MoreThanOrEqual(filters.from);
    } else if (filters.to) {
      where.expectedAt = LessThanOrEqual(filters.to);
    }

    const rows = await this.repository.find({
      where,
      order: { expectedAt: 'DESC' },
      take: 200,
    });

    return rows.map((row) => VisitorPassMapper.toDomain(row));
  }
}
