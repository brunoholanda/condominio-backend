import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CacheStore } from '../../../../../shared/application/ports/cache-store';
import { CacheKeys } from '../../../../../shared/infrastructure/cache/cache-keys';
import { requireRevivedDate } from '../../../../../shared/infrastructure/cache/cache-serialize';
import { CacheTtl } from '../../../../../shared/infrastructure/cache/cache-ttl';
import type { MembershipSnapshot } from '../../../domain/entities/membership';
import { Membership } from '../../../domain/entities/membership';
import { MembershipRepository } from '../../../domain/repositories/membership.repository';
import { MembershipOrmEntity } from './entities/membership.orm-entity';
import { MembershipMapper } from './membership.mapper';

@Injectable()
export class TypeormMembershipRepository extends MembershipRepository {
  constructor(
    @InjectRepository(MembershipOrmEntity)
    private readonly repository: Repository<MembershipOrmEntity>,
    private readonly cache: CacheStore,
  ) {
    super();
  }

  async save(membership: Membership): Promise<Membership> {
    await this.repository.save(MembershipMapper.toPersistence(membership));

    const row = await this.repository.findOne({ where: { id: membership.id } });

    if (!row) {
      throw new Error(`Falha ao persistir o vínculo ${membership.id}.`);
    }

    const saved = MembershipMapper.toDomain(row);
    await this.invalidateMembership(saved);

    return saved;
  }

  async findByUserAndCondo(userId: string, condominiumId: string): Promise<Membership | null> {
    const key = CacheKeys.membership(userId, condominiumId);
    const cached = await this.cache.get<MembershipSnapshot | null>(key);

    if (cached !== undefined) {
      return cached ? this.fromSnapshot(cached) : null;
    }

    const row = await this.repository.findOne({ where: { userId, condominiumId } });
    const membership = row ? MembershipMapper.toDomain(row) : null;
    const ttl = membership ? CacheTtl.membership : CacheTtl.negative;

    await this.cache.set(key, membership ? membership.toSnapshot() : null, ttl);

    return membership;
  }

  async findManyByUser(userId: string): Promise<Membership[]> {
    const key = CacheKeys.membershipsByUser(userId);
    const cached = await this.cache.get<MembershipSnapshot[]>(key);

    if (cached !== undefined) {
      return cached.map((item) => this.fromSnapshot(item));
    }

    const rows = await this.repository.find({ where: { userId } });
    const list = rows.map((row) => MembershipMapper.toDomain(row));
    await this.cache.set(
      key,
      list.map((item) => item.toSnapshot()),
      CacheTtl.membership,
    );

    return list;
  }

  async findManyByCondo(condominiumId: string): Promise<Membership[]> {
    const key = CacheKeys.membershipsByCondo(condominiumId);
    const cached = await this.cache.get<MembershipSnapshot[]>(key);

    if (cached !== undefined) {
      return cached.map((item) => this.fromSnapshot(item));
    }

    const rows = await this.repository.find({ where: { condominiumId } });
    const list = rows.map((row) => MembershipMapper.toDomain(row));
    await this.cache.set(
      key,
      list.map((item) => item.toSnapshot()),
      CacheTtl.membership,
    );

    return list;
  }

  async delete(id: string): Promise<void> {
    const row = await this.repository.findOne({ where: { id } });

    await this.repository.delete({ id });

    if (row) {
      await this.invalidateMembership(MembershipMapper.toDomain(row));
    }
  }

  private fromSnapshot(snapshot: MembershipSnapshot): Membership {
    return Membership.restore({
      ...snapshot,
      createdAt: requireRevivedDate(snapshot.createdAt, 'createdAt'),
    });
  }

  private async invalidateMembership(membership: Membership): Promise<void> {
    await this.cache.del(
      CacheKeys.membership(membership.userId, membership.condominiumId),
      CacheKeys.membershipsByUser(membership.userId),
      CacheKeys.membershipsByCondo(membership.condominiumId),
    );
  }
}
