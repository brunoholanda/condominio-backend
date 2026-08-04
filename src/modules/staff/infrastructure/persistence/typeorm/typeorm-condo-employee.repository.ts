import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CondoEmployee } from '../../../domain/entities/condo-employee';
import { CondoEmployeeRepository } from '../../../domain/repositories/condo-employee.repository';
import { CondoEmployeeMapper } from './condo-employee.mapper';
import { CondoEmployeeOrmEntity } from './entities/condo-employee.orm-entity';

@Injectable()
export class TypeormCondoEmployeeRepository extends CondoEmployeeRepository {
  constructor(
    @InjectRepository(CondoEmployeeOrmEntity)
    private readonly repo: Repository<CondoEmployeeOrmEntity>,
  ) {
    super();
  }

  async save(employee: CondoEmployee): Promise<CondoEmployee> {
    await this.repo.save(CondoEmployeeMapper.toPersistence(employee));

    return employee;
  }

  async update(employee: CondoEmployee): Promise<CondoEmployee> {
    await this.repo.save(CondoEmployeeMapper.toPersistence(employee));

    return employee;
  }

  async findById(id: string, condominiumId: string): Promise<CondoEmployee | null> {
    const row = await this.repo.findOne({ where: { id, condominiumId } });

    return row ? CondoEmployeeMapper.toDomain(row) : null;
  }

  async findByCpf(cpf: string, condominiumId: string): Promise<CondoEmployee | null> {
    const row = await this.repo.findOne({ where: { cpf, condominiumId } });

    return row ? CondoEmployeeMapper.toDomain(row) : null;
  }

  async findIdByCpf(cpf: string, condominiumId: string): Promise<string | null> {
    const row = await this.repo.findOne({
      where: { cpf, condominiumId },
      select: { id: true },
    });

    return row?.id ?? null;
  }

  async listByCondominium(condominiumId: string): Promise<CondoEmployee[]> {
    const rows = await this.repo.find({
      where: { condominiumId },
      order: { fullName: 'ASC' },
    });

    return rows.map((row) => CondoEmployeeMapper.toDomain(row));
  }

  async delete(id: string, condominiumId: string): Promise<void> {
    await this.repo.delete({ id, condominiumId });
  }
}
