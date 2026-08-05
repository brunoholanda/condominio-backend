import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { DataSource } from 'typeorm';

import { CacheStore } from '../../../../../shared/application/ports/cache-store';
import { CacheKeys } from '../../../../../shared/infrastructure/cache/cache-keys';
import { requireRevivedDate, reviveDate } from '../../../../../shared/infrastructure/cache/cache-serialize';
import { CacheTtl } from '../../../../../shared/infrastructure/cache/cache-ttl';
import type { CondominiumSnapshot } from '../../../domain/entities/condominium';
import { Condominium } from '../../../domain/entities/condominium';
import { CondominiumRepository } from '../../../domain/repositories/condominium.repository';
import { CondominiumMapper } from './condominium.mapper';
import { CondoUnitOrmEntity } from './entities/condo-unit.orm-entity';
import { CondominiumOrmEntity } from './entities/condominium.orm-entity';
import { MembershipOrmEntity } from './entities/membership.orm-entity';

@Injectable()
export class TypeormCondominiumRepository extends CondominiumRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly cache: CacheStore,
  ) {
    super();
  }

  async save(condominium: Condominium): Promise<Condominium> {
    const previous = await this.dataSource
      .getRepository(CondominiumOrmEntity)
      .findOne({ where: { id: condominium.id }, select: { id: true, slug: true } });

    const row = CondominiumMapper.toPersistence(condominium);

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(CondominiumOrmEntity).save(row);
      await this.persistUnits(manager, condominium.id, condominium.unitNumbers);
    });

    await this.invalidateCondo(condominium.id, previous?.slug, condominium.slug.value);

    const saved = await this.findById(condominium.id);

    if (!saved) {
      throw new Error(`Falha ao persistir o condomínio ${condominium.id}.`);
    }

    return saved;
  }

  async findById(id: string): Promise<Condominium | null> {
    const key = CacheKeys.condominiumById(id);
    const cached = await this.cache.get<CondominiumSnapshot | null>(key);

    if (cached !== undefined) {
      return cached ? this.fromSnapshot(cached) : null;
    }

    const row = await this.dataSource
      .getRepository(CondominiumOrmEntity)
      .findOne({ where: { id } });

    if (!row) {
      await this.cache.set(key, null, CacheTtl.negative);

      return null;
    }

    const condominium = CondominiumMapper.toDomain(row, await this.loadUnitNumbers(id));
    await this.writeCondoCache(condominium);

    return condominium;
  }

  async findBySlug(slug: string): Promise<Condominium | null> {
    const normalized = slug.toLowerCase();
    const key = CacheKeys.condominiumBySlug(normalized);
    const cached = await this.cache.get<CondominiumSnapshot | null>(key);

    if (cached !== undefined) {
      return cached ? this.fromSnapshot(cached) : null;
    }

    const row = await this.dataSource
      .getRepository(CondominiumOrmEntity)
      .findOne({ where: { slug: normalized } });

    if (!row) {
      await this.cache.set(key, null, CacheTtl.negative);

      return null;
    }

    const condominium = CondominiumMapper.toDomain(row, await this.loadUnitNumbers(row.id));
    await this.writeCondoCache(condominium);

    return condominium;
  }

  async findManyByUserId(userId: string): Promise<Condominium[]> {
    const rows: CondominiumOrmEntity[] = await this.dataSource
      .getRepository(CondominiumOrmEntity)
      .createQueryBuilder('condominium')
      .innerJoin(MembershipOrmEntity, 'membership', 'membership.condominium_id = condominium.id')
      .where('membership.user_id = :userId', { userId })
      .orderBy('condominium.name', 'ASC')
      .getMany();

    return Promise.all(rows.map(async (row) => {
      const cached = await this.findById(row.id);

      return cached ?? CondominiumMapper.toDomain(row, await this.loadUnitNumbers(row.id));
    }));
  }

  async findAll(): Promise<Condominium[]> {
    const rows = await this.dataSource.getRepository(CondominiumOrmEntity).find({
      order: { name: 'ASC' },
    });

    return Promise.all(rows.map(async (row) => {
      const cached = await this.findById(row.id);

      return cached ?? CondominiumMapper.toDomain(row, await this.loadUnitNumbers(row.id));
    }));
  }

  update(condominium: Condominium): Promise<Condominium> {
    return this.save(condominium);
  }

  async delete(id: string): Promise<void> {
    const previous = await this.dataSource
      .getRepository(CondominiumOrmEntity)
      .findOne({ where: { id }, select: { id: true, slug: true } });

    await this.dataSource.getRepository(CondominiumOrmEntity).delete({ id });

    if (previous) {
      await this.invalidateCondo(id, previous.slug);
    }
  }

  async listUnitNumbers(condominiumId: string): Promise<string[]> {
    const key = CacheKeys.condoUnits(condominiumId);
    const cached = await this.cache.get<string[]>(key);

    if (cached !== undefined) {
      return cached;
    }

    const numbers = await this.loadUnitNumbers(condominiumId);
    await this.cache.set(key, numbers, CacheTtl.condominium);

    return numbers;
  }

  async listVacantUnitNumbers(condominiumId: string): Promise<string[]> {
    const key = CacheKeys.condoVacantUnits(condominiumId);
    const cached = await this.cache.get<string[]>(key);

    if (cached !== undefined) {
      return cached;
    }

    const rows = await this.dataSource.getRepository(CondoUnitOrmEntity).find({
      where: { condominiumId, isVacant: true },
      order: { number: 'ASC' },
    });
    const numbers = rows.map((row) => row.number);
    await this.cache.set(key, numbers, CacheTtl.condominium);

    return numbers;
  }

  async setUnitVacant(
    condominiumId: string,
    unitNumber: string,
    isVacant: boolean,
  ): Promise<boolean> {
    const result = await this.dataSource
      .getRepository(CondoUnitOrmEntity)
      .update({ condominiumId, number: unitNumber }, { isVacant });

    if ((result.affected ?? 0) > 0) {
      const slug = await this.resolveSlug(condominiumId);
      await this.invalidateCondo(condominiumId, slug);
    }

    return (result.affected ?? 0) > 0;
  }

  async replaceUnits(condominiumId: string, numbers: string[]): Promise<void> {
    await this.dataSource.transaction((manager) =>
      this.persistUnits(manager, condominiumId, numbers),
    );

    const slug = await this.resolveSlug(condominiumId);
    await this.invalidateCondo(condominiumId, slug);
  }

  private async loadUnitNumbers(condominiumId: string): Promise<string[]> {
    const rows = await this.dataSource.getRepository(CondoUnitOrmEntity).find({
      where: { condominiumId },
      order: { number: 'ASC' },
    });

    return rows.map((row) => row.number);
  }

  private async resolveSlug(condominiumId: string): Promise<string | undefined> {
    const row = await this.dataSource
      .getRepository(CondominiumOrmEntity)
      .findOne({ where: { id: condominiumId }, select: { slug: true } });

    return row?.slug;
  }

  private async writeCondoCache(condominium: Condominium): Promise<void> {
    const snapshot = condominium.toSnapshot();

    await Promise.all([
      this.cache.set(CacheKeys.condominiumById(condominium.id), snapshot, CacheTtl.condominium),
      this.cache.set(
        CacheKeys.condominiumBySlug(condominium.slug.value),
        snapshot,
        CacheTtl.condominium,
      ),
      this.cache.set(
        CacheKeys.condoUnits(condominium.id),
        snapshot.unitNumbers,
        CacheTtl.condominium,
      ),
    ]);
  }

  private async invalidateCondo(
    id: string,
    previousSlug?: string | null,
    nextSlug?: string,
  ): Promise<void> {
    const keys = [
      CacheKeys.condominiumById(id),
      CacheKeys.condoUnits(id),
      CacheKeys.condoVacantUnits(id),
    ];

    if (previousSlug) {
      keys.push(CacheKeys.condominiumBySlug(previousSlug));
    }

    if (nextSlug && nextSlug !== previousSlug) {
      keys.push(CacheKeys.condominiumBySlug(nextSlug));
    }

    await this.cache.del(...keys);
  }

  private fromSnapshot(snapshot: CondominiumSnapshot): Condominium {
    return Condominium.restore({
      ...snapshot,
      buildingHandoverDate: reviveDate(snapshot.buildingHandoverDate),
      createdAt: requireRevivedDate(snapshot.createdAt, 'createdAt'),
      updatedAt: requireRevivedDate(snapshot.updatedAt, 'updatedAt'),
    });
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
