import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CacheStore } from '../../../../../shared/application/ports/cache-store';
import { CacheKeys } from '../../../../../shared/infrastructure/cache/cache-keys';
import { requireRevivedDate } from '../../../../../shared/infrastructure/cache/cache-serialize';
import { CacheTtl } from '../../../../../shared/infrastructure/cache/cache-ttl';
import {
  ResidentAccount,
  type ResidentAccountSnapshot,
} from '../../../domain/entities/resident-account';
import { ResidentAccountRepository } from '../../../domain/repositories/resident-account.repository';
import { ResidentAccountOrmEntity } from './entities/resident-account.orm-entity';
import { ResidentAccountMapper } from './resident-account.mapper';

@Injectable()
export class TypeormResidentAccountRepository extends ResidentAccountRepository {
  constructor(
    @InjectRepository(ResidentAccountOrmEntity)
    private readonly repository: Repository<ResidentAccountOrmEntity>,
    private readonly cache: CacheStore,
  ) {
    super();
  }

  async save(account: ResidentAccount): Promise<ResidentAccount> {
    await this.repository.save(ResidentAccountMapper.toPersistence(account));

    const row = await this.repository.findOne({ where: { id: account.id } });

    if (!row) {
      throw new Error(`Falha ao persistir a conta do morador ${account.id}.`);
    }

    const saved = ResidentAccountMapper.toDomain(row);
    await this.invalidateAccount(saved.toSnapshot());

    return saved;
  }

  async findByUserAndCondo(userId: string, condominiumId: string): Promise<ResidentAccount | null> {
    const key = CacheKeys.residentAccount(userId, condominiumId);
    const cached = await this.cache.get<ResidentAccountSnapshot | null>(key);

    if (cached !== undefined) {
      return cached ? this.fromSnapshot(cached) : null;
    }

    const row = await this.repository.findOne({ where: { userId, condominiumId } });
    const account = row ? ResidentAccountMapper.toDomain(row) : null;
    const ttl = account ? CacheTtl.residentAccount : CacheTtl.negative;

    await this.cache.set(key, account ? account.toSnapshot() : null, ttl);

    return account;
  }

  async findById(id: string): Promise<ResidentAccount | null> {
    const row = await this.repository.findOne({ where: { id } });

    return row ? ResidentAccountMapper.toDomain(row) : null;
  }

  async findManyByCondo(condominiumId: string): Promise<ResidentAccount[]> {
    const rows = await this.repository.find({
      where: { condominiumId },
      order: { unitNumber: 'ASC' },
    });

    return rows.map((row) => ResidentAccountMapper.toDomain(row));
  }

  async delete(id: string): Promise<void> {
    const row = await this.repository.findOne({ where: { id } });

    await this.repository.delete({ id });

    if (row) {
      await this.invalidateAccount({
        id: row.id,
        userId: row.userId,
        condominiumId: row.condominiumId,
        unitNumber: row.unitNumber,
        createdAt: row.createdAt,
      });
    }
  }

  private fromSnapshot(snapshot: ResidentAccountSnapshot): ResidentAccount {
    return ResidentAccount.restore({
      ...snapshot,
      createdAt: requireRevivedDate(snapshot.createdAt, 'createdAt'),
    });
  }

  private async invalidateAccount(snapshot: ResidentAccountSnapshot): Promise<void> {
    await this.cache.del(CacheKeys.residentAccount(snapshot.userId, snapshot.condominiumId));
  }
}
