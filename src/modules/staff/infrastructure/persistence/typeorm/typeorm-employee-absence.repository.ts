import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';

import { EmployeeAbsence } from '../../../domain/entities/employee-absence';
import {
  EmployeeAbsenceRepository,
  type EmployeeAbsenceFilters,
} from '../../../domain/repositories/employee-absence.repository';
import { EmployeeAbsenceMapper } from './employee-absence.mapper';
import { EmployeeAbsenceOrmEntity } from './entities/employee-absence.orm-entity';

@Injectable()
export class TypeormEmployeeAbsenceRepository extends EmployeeAbsenceRepository {
  constructor(
    @InjectRepository(EmployeeAbsenceOrmEntity)
    private readonly repo: Repository<EmployeeAbsenceOrmEntity>,
  ) {
    super();
  }

  async save(absence: EmployeeAbsence): Promise<EmployeeAbsence> {
    await this.repo.save(EmployeeAbsenceMapper.toPersistence(absence));

    return absence;
  }

  async update(absence: EmployeeAbsence): Promise<EmployeeAbsence> {
    await this.repo.save(EmployeeAbsenceMapper.toPersistence(absence));

    return absence;
  }

  async findById(id: string, condominiumId: string): Promise<EmployeeAbsence | null> {
    const row = await this.repo.findOne({ where: { id, condominiumId } });

    return row ? EmployeeAbsenceMapper.toDomain(row) : null;
  }

  async list(filters: EmployeeAbsenceFilters): Promise<EmployeeAbsence[]> {
    const where: Record<string, unknown> = { condominiumId: filters.condominiumId };

    if (filters.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters.reason) {
      where.reason = filters.reason;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.from && filters.to) {
      where.startDate = Between(
        filters.from.toISOString().slice(0, 10),
        filters.to.toISOString().slice(0, 10),
      );
    } else if (filters.from) {
      where.startDate = MoreThanOrEqual(filters.from.toISOString().slice(0, 10));
    } else if (filters.to) {
      where.startDate = LessThanOrEqual(filters.to.toISOString().slice(0, 10));
    }

    const rows = await this.repo.find({
      where,
      order: { startDate: 'DESC', createdAt: 'DESC' },
      take: 500,
    });

    return rows.map((row) => EmployeeAbsenceMapper.toDomain(row));
  }

  async delete(id: string, condominiumId: string): Promise<void> {
    await this.repo.delete({ id, condominiumId });
  }
}
