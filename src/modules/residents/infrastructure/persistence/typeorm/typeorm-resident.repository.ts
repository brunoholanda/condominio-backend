import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { EntityManager, SelectQueryBuilder } from 'typeorm';
import { DataSource, In } from 'typeorm';

import type { PaginatedResult } from '../../../../../shared/application/paginated-result';
import { buildPaginatedResult } from '../../../../../shared/application/paginated-result';
import { onlyDigits } from '../../../../../shared/domain/guards';
import type { Resident } from '../../../domain/entities/resident';
import type {
  ResidentFilters,
  ResidentQuery,
  ResidentsTally,
} from '../../../domain/repositories/resident.repository';
import { ResidentRepository } from '../../../domain/repositories/resident.repository';
import { HouseholdMemberOrmEntity } from './entities/household-member.orm-entity';
import { PetOrmEntity } from './entities/pet.orm-entity';
import { ResidentOrmEntity } from './entities/resident.orm-entity';
import { UnitEmployeeOrmEntity } from './entities/unit-employee.orm-entity';
import { VehicleOrmEntity } from './entities/vehicle.orm-entity';
import { ResidentMapper } from './resident.mapper';

const CHILD_ENTITIES = [
  HouseholdMemberOrmEntity,
  UnitEmployeeOrmEntity,
  VehicleOrmEntity,
  PetOrmEntity,
];

@Injectable()
export class TypeormResidentRepository extends ResidentRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  /**
   * Persists the aggregate as a unit: the children have no identity of their own,
   * so they are rewritten on every save inside a single transaction.
   */
  async save(resident: Resident): Promise<Resident> {
    const row = ResidentMapper.toPersistence(resident);

    await this.dataSource.transaction(async (manager) => {
      await this.deleteChildren(manager, resident.id);
      await manager.getRepository(ResidentOrmEntity).save(row);
    });

    const saved = await this.findById(resident.id, resident.condominiumId);

    if (!saved) {
      throw new Error(`Falha ao persistir o morador ${resident.id}.`);
    }

    return saved;
  }

  async findById(id: string, condominiumId: string): Promise<Resident | null> {
    const row = await this.dataSource
      .getRepository(ResidentOrmEntity)
      .findOne({ where: { id, condominiumId } });

    return row ? ResidentMapper.toDomain(row) : null;
  }

  async findMany(
    query: ResidentQuery & { condominiumId: string },
  ): Promise<PaginatedResult<Resident>> {
    const builder = this.createFilteredQuery(query)
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [rows, total] = await builder.getManyAndCount();

    return buildPaginatedResult(
      rows.map((row) => ResidentMapper.toDomain(row)),
      total,
      query,
    );
  }

  async findAll(filters: ResidentFilters & { condominiumId: string }): Promise<Resident[]> {
    const rows = await this.createFilteredQuery(filters).getMany();

    return rows.map((row) => ResidentMapper.toDomain(row));
  }

  async findIdByCpf(cpf: string, condominiumId: string): Promise<string | null> {
    const row = await this.dataSource.getRepository(ResidentOrmEntity).findOne({
      where: { cpf: onlyDigits(cpf), condominiumId },
      select: { id: true },
      loadEagerRelations: false,
    });

    return row?.id ?? null;
  }

  async findIdByUnit(unit: string, condominiumId: string): Promise<string | null> {
    const row = await this.dataSource.getRepository(ResidentOrmEntity).findOne({
      where: { unit, condominiumId },
      select: { id: true },
      loadEagerRelations: false,
    });

    return row?.id ?? null;
  }

  async findByUnitAndCpf(
    unit: string,
    cpf: string,
    condominiumId: string,
  ): Promise<Resident | null> {
    const row = await this.dataSource.getRepository(ResidentOrmEntity).findOne({
      where: { unit: unit.trim(), cpf: onlyDigits(cpf), condominiumId },
    });

    return row ? ResidentMapper.toDomain(row) : null;
  }

  async tally(condominiumId: string): Promise<ResidentsTally> {
    const rows = await this.dataSource.getRepository(ResidentOrmEntity).find({
      where: { condominiumId },
      select: { id: true, unit: true },
      order: { unit: 'ASC' },
      loadEagerRelations: false,
    });
    const residentIds = rows.map((row) => row.id);
    const householdMembers = residentIds.length
      ? await this.dataSource
          .getRepository(HouseholdMemberOrmEntity)
          .count({ where: { residentId: In(residentIds) } })
      : 0;
    const registeredUnits = rows.map((row) => row.unit);

    return { registeredUnits, totalPeople: registeredUnits.length + householdMembers };
  }

  async deleteById(id: string, condominiumId: string): Promise<void> {
    await this.dataSource.getRepository(ResidentOrmEntity).delete({ id, condominiumId });
  }

  private async deleteChildren(manager: EntityManager, residentId: string): Promise<void> {
    for (const entity of CHILD_ENTITIES) {
      await manager.delete(entity, { residentId });
    }
  }

  private createFilteredQuery(
    filters: ResidentFilters & { condominiumId: string },
  ): SelectQueryBuilder<ResidentOrmEntity> {
    const builder = this.dataSource
      .getRepository(ResidentOrmEntity)
      .createQueryBuilder('resident')
      .leftJoinAndSelect('resident.householdMembers', 'householdMembers')
      .leftJoinAndSelect('resident.employees', 'employees')
      .leftJoinAndSelect('resident.vehicles', 'vehicles')
      .leftJoinAndSelect('resident.pets', 'pets')
      .where('resident.condominiumId = :condominiumId', { condominiumId: filters.condominiumId })
      .orderBy('resident.unit', 'ASC')
      .addOrderBy('resident.fullName', 'ASC');

    TypeormResidentRepository.applyFilters(builder, filters);

    return builder;
  }

  private static applyFilters(
    builder: SelectQueryBuilder<ResidentOrmEntity>,
    query: ResidentFilters,
  ): void {
    if (query.unit) {
      builder.andWhere('resident.unit = :unit', { unit: query.unit.trim() });
    }

    if (query.occupancyType) {
      builder.andWhere('resident.occupancyType = :occupancyType', {
        occupancyType: query.occupancyType,
      });
    }

    if (!query.search) {
      return;
    }

    const conditions = [
      'resident.fullName ILIKE :term',
      'resident.unit ILIKE :term',
      'resident.email ILIKE :term',
    ];
    const digits = onlyDigits(query.search);

    if (digits) {
      conditions.push('resident.cpf LIKE :digits');
    }

    builder.andWhere(`(${conditions.join(' OR ')})`, {
      term: `%${query.search}%`,
      digits: `%${digits}%`,
    });
  }
}
