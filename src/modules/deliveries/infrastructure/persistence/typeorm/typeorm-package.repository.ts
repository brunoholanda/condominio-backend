import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { DataSource } from 'typeorm';

import type { PaginatedResult } from '../../../../../shared/application/paginated-result';
import { buildPaginatedResult } from '../../../../../shared/application/paginated-result';
import type { Package } from '../../../domain/entities/package';
import type {
  PackageFilters,
  PackageQuery,
} from '../../../domain/repositories/package.repository';
import { PackageRepository } from '../../../domain/repositories/package.repository';
import { PackageOrmEntity } from './entities/package.orm-entity';
import { PackageMapper } from './package.mapper';

@Injectable()
export class TypeormPackageRepository extends PackageRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  async save(parcel: Package): Promise<Package> {
    const row = PackageMapper.toPersistence(parcel);

    await this.dataSource.getRepository(PackageOrmEntity).save(row);

    const saved = await this.findById(parcel.id, parcel.condominiumId);

    if (!saved) {
      throw new Error(`Falha ao persistir a encomenda ${parcel.id}.`);
    }

    return saved;
  }

  async findById(id: string, condominiumId?: string): Promise<Package | null> {
    const row = await this.dataSource.getRepository(PackageOrmEntity).findOne({
      where: condominiumId ? { id, condominiumId } : { id },
    });

    return row ? PackageMapper.toDomain(row) : null;
  }

  async findMany(query: PackageQuery): Promise<PaginatedResult<Package>> {
    const builder = this.createFilteredQuery(query.condominiumId, query)
      .orderBy('package.status', 'ASC')
      .addOrderBy('package.receivedAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [rows, total] = await builder.getManyAndCount();

    return buildPaginatedResult(
      rows.map((row) => PackageMapper.toDomain(row)),
      total,
      query,
    );
  }

  private createFilteredQuery(
    condominiumId: string,
    filters: PackageFilters,
  ): SelectQueryBuilder<PackageOrmEntity> {
    const builder = this.dataSource
      .getRepository(PackageOrmEntity)
      .createQueryBuilder('package')
      .where('package.condominiumId = :condominiumId', { condominiumId });

    if (filters.status) {
      builder.andWhere('package.status = :status', { status: filters.status });
    }

    if (filters.unitNumber) {
      builder.andWhere('package.unitNumber = :unitNumber', {
        unitNumber: filters.unitNumber.trim(),
      });
    }

    if (filters.search?.trim()) {
      builder.andWhere(
        `(package.description ILIKE :term OR package.carrier ILIKE :term OR package.unitNumber ILIKE :term OR package.recipientName ILIKE :term)`,
        { term: `%${filters.search.trim()}%` },
      );
    }

    return builder;
  }
}
