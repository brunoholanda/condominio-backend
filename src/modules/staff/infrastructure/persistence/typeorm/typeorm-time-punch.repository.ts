import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';

import { TimePunch } from '../../../domain/entities/time-punch';
import { PunchStatus } from '../../../domain/enums/staff.enums';
import {
  TimePunchRepository,
  type TimePunchFilters,
} from '../../../domain/repositories/time-punch.repository';
import { TimePunchMapper } from './time-punch.mapper';
import { TimePunchOrmEntity } from './entities/time-punch.orm-entity';

@Injectable()
export class TypeormTimePunchRepository extends TimePunchRepository {
  constructor(
    @InjectRepository(TimePunchOrmEntity)
    private readonly repo: Repository<TimePunchOrmEntity>,
  ) {
    super();
  }

  async save(punch: TimePunch): Promise<TimePunch> {
    await this.repo.save(TimePunchMapper.toPersistence(punch));

    return punch;
  }

  async findById(id: string, condominiumId: string): Promise<TimePunch | null> {
    const row = await this.repo.findOne({ where: { id, condominiumId } });

    return row ? TimePunchMapper.toDomain(row) : null;
  }

  async list(filters: TimePunchFilters): Promise<TimePunch[]> {
    const where: Record<string, unknown> = { condominiumId: filters.condominiumId };

    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.from && filters.to) {
      where.punchedAt = Between(filters.from, filters.to);
    } else if (filters.from) {
      where.punchedAt = MoreThanOrEqual(filters.from);
    } else if (filters.to) {
      where.punchedAt = LessThanOrEqual(filters.to);
    }

    const rows = await this.repo.find({
      where,
      order: { punchedAt: 'DESC' },
      take: 500,
    });

    return rows.map((row) => TimePunchMapper.toDomain(row));
  }

  async findLastAcceptedOfDay(
    employeeId: string,
    dayStart: Date,
    dayEnd: Date,
  ): Promise<TimePunch | null> {
    const row = await this.repo.findOne({
      where: {
        employeeId,
        status: PunchStatus.Accepted,
        punchedAt: Between(dayStart, dayEnd),
      },
      order: { punchedAt: 'DESC' },
    });

    return row ? TimePunchMapper.toDomain(row) : null;
  }

  async listSelfiesForPurge(
    condominiumId: string,
    olderThan: Date,
  ): Promise<TimePunch[]> {
    const rows = await this.repo.find({
      where: {
        condominiumId,
        selfieStorageKey: Not(IsNull()),
        selfiePurgedAt: IsNull(),
        punchedAt: LessThan(olderThan),
      },
      take: 500,
      order: { punchedAt: 'ASC' },
    });

    return rows.map((row) => TimePunchMapper.toDomain(row));
  }
}
