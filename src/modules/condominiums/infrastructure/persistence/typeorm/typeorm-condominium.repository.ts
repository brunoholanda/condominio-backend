import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { DataSource } from 'typeorm';

import type { Condominium } from '../../../domain/entities/condominium';
import { CondominiumRepository } from '../../../domain/repositories/condominium.repository';
import { CondominiumMapper } from './condominium.mapper';
import { CondoUnitOrmEntity } from './entities/condo-unit.orm-entity';
import { CondominiumOrmEntity } from './entities/condominium.orm-entity';
import { MembershipOrmEntity } from './entities/membership.orm-entity';

@Injectable()
export class TypeormCondominiumRepository extends CondominiumRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  async save(condominium: Condominium): Promise<Condominium> {
    const row = CondominiumMapper.toPersistence(condominium);

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(CondominiumOrmEntity).save(row);
      await this.persistUnits(manager, condominium.id, condominium.unitNumbers);
    });

    const saved = await this.findById(condominium.id);

    if (!saved) {
      throw new Error(`Falha ao persistir o condomínio ${condominium.id}.`);
    }

    return saved;
  }

  async findById(id: string): Promise<Condominium | null> {
    const row = await this.dataSource
      .getRepository(CondominiumOrmEntity)
      .findOne({ where: { id } });

    if (!row) {
      return null;
    }

    return CondominiumMapper.toDomain(row, await this.listUnitNumbers(id));
  }

  async findBySlug(slug: string): Promise<Condominium | null> {
    const row = await this.dataSource
      .getRepository(CondominiumOrmEntity)
      .findOne({ where: { slug: slug.toLowerCase() } });

    if (!row) {
      return null;
    }

    return CondominiumMapper.toDomain(row, await this.listUnitNumbers(row.id));
  }

  async findManyByUserId(userId: string): Promise<Condominium[]> {
    const rows: CondominiumOrmEntity[] = await this.dataSource
      .getRepository(CondominiumOrmEntity)
      .createQueryBuilder('condominium')
      .innerJoin(MembershipOrmEntity, 'membership', 'membership.condominium_id = condominium.id')
      .where('membership.user_id = :userId', { userId })
      .orderBy('condominium.name', 'ASC')
      .getMany();

    return Promise.all(
      rows.map(async (row) => CondominiumMapper.toDomain(row, await this.listUnitNumbers(row.id))),
    );
  }

  async findAll(): Promise<Condominium[]> {
    const rows = await this.dataSource.getRepository(CondominiumOrmEntity).find({
      order: { name: 'ASC' },
    });

    return Promise.all(
      rows.map(async (row) => CondominiumMapper.toDomain(row, await this.listUnitNumbers(row.id))),
    );
  }

  update(condominium: Condominium): Promise<Condominium> {
    return this.save(condominium);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.getRepository(CondominiumOrmEntity).delete({ id });
  }

  async listUnitNumbers(condominiumId: string): Promise<string[]> {
    const rows = await this.dataSource.getRepository(CondoUnitOrmEntity).find({
      where: { condominiumId },
      order: { number: 'ASC' },
    });

    return rows.map((row) => row.number);
  }

  async listVacantUnitNumbers(condominiumId: string): Promise<string[]> {
    const rows = await this.dataSource.getRepository(CondoUnitOrmEntity).find({
      where: { condominiumId, isVacant: true },
      order: { number: 'ASC' },
    });

    return rows.map((row) => row.number);
  }

  async setUnitVacant(
    condominiumId: string,
    unitNumber: string,
    isVacant: boolean,
  ): Promise<boolean> {
    const result = await this.dataSource
      .getRepository(CondoUnitOrmEntity)
      .update({ condominiumId, number: unitNumber }, { isVacant });

    return (result.affected ?? 0) > 0;
  }

  async replaceUnits(condominiumId: string, numbers: string[]): Promise<void> {
    await this.dataSource.transaction((manager) =>
      this.persistUnits(manager, condominiumId, numbers),
    );
  }

  private async persistUnits(
    manager: EntityManager,
    condominiumId: string,
    numbers: string[],
  ): Promise<void> {
    const existing = await manager.getRepository(CondoUnitOrmEntity).find({
      where: { condominiumId },
    });
    const vacantByNumber = new Map(
      existing.filter((row) => row.isVacant).map((row) => [row.number, true] as const),
    );

    await manager.delete(CondoUnitOrmEntity, { condominiumId });

    if (numbers.length === 0) {
      return;
    }

    const rows = numbers.map((number) => ({
      id: randomUUID(),
      condominiumId,
      number,
      isVacant: vacantByNumber.get(number) ?? false,
    }));

    await manager.getRepository(CondoUnitOrmEntity).insert(rows);
  }
}
