import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CacheStore } from '../../../../../shared/application/ports/cache-store';
import { CacheKeys } from '../../../../../shared/infrastructure/cache/cache-keys';
import { requireRevivedDate, reviveDate } from '../../../../../shared/infrastructure/cache/cache-serialize';
import { CacheTtl } from '../../../../../shared/infrastructure/cache/cache-ttl';
import { User } from '../../../domain/entities/user';
import type { UserSnapshot } from '../../../domain/entities/user';
import type { PlatformRole } from '../../../domain/enums/platform-role';
import type { SubscriptionPlan } from '../../../domain/enums/subscription-plan';
import type { SubscriptionStatus } from '../../../domain/enums/subscription-status';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { UserOrmEntity } from './entities/user.orm-entity';

@Injectable()
export class TypeormUserRepository extends UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
    private readonly cache: CacheStore,
  ) {
    super();
  }

  async findByEmail(email: string): Promise<User | null> {
    const normalized = email.toLowerCase();
    const key = CacheKeys.userByEmail(normalized);
    const cached = await this.cache.get<UserSnapshot | null>(key);

    if (cached !== undefined) {
      return cached ? this.fromSnapshot(cached) : null;
    }

    const row = await this.repository.findOne({ where: { email: normalized } });
    const user = row ? this.toDomain(row) : null;
    await this.writeUserCache(user, normalized);

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const key = CacheKeys.userById(id);
    const cached = await this.cache.get<UserSnapshot | null>(key);

    if (cached !== undefined) {
      return cached ? this.fromSnapshot(cached) : null;
    }

    const row = await this.repository.findOne({ where: { id } });

    if (!row) {
      await this.cache.set(key, null, CacheTtl.negative);

      return null;
    }

    const user = this.toDomain(row);
    await this.writeUserCache(user);

    return user;
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
    const row = await this.repository.findOne({ where: { stripeCustomerId } });

    return row ? this.toDomain(row) : null;
  }

  async findIdByCpf(cpf: string): Promise<string | null> {
    const row = await this.repository.findOne({ where: { cpf }, select: { id: true } });

    return row?.id ?? null;
  }

  async findAll(): Promise<User[]> {
    const rows = await this.repository.find({ order: { name: 'ASC' } });

    return rows.map((row) => this.toDomain(row));
  }

  async save(user: User): Promise<User> {
    const previous = await this.repository.findOne({
      where: { id: user.id },
      select: { id: true, email: true },
    });
    const snapshot = user.toSnapshot();

    await this.repository.save({
      id: snapshot.id,
      name: snapshot.name,
      email: snapshot.email,
      passwordHash: snapshot.passwordHash,
      cpf: snapshot.cpf,
      platformRole: snapshot.platformRole,
      isActive: snapshot.isActive,
      plan: snapshot.plan,
      subscriptionStatus: snapshot.subscriptionStatus,
      trialEndsAt: snapshot.trialEndsAt,
      subscriptionUpdatedAt: snapshot.subscriptionUpdatedAt,
      stripeCustomerId: snapshot.stripeCustomerId,
      stripeSubscriptionId: snapshot.stripeSubscriptionId,
    });

    await this.invalidateUser(user.id, previous?.email, snapshot.email);

    const saved = await this.findById(user.id);

    if (!saved) {
      throw new Error(`Falha ao persistir o usuário ${user.id}.`);
    }

    return saved;
  }

  private async writeUserCache(user: User | null, emailHint?: string): Promise<void> {
    if (!user) {
      if (emailHint) {
        await this.cache.set(CacheKeys.userByEmail(emailHint), null, CacheTtl.negative);
      }

      return;
    }

    const snapshot = user.toSnapshot();

    await Promise.all([
      this.cache.set(CacheKeys.userById(user.id), snapshot, CacheTtl.user),
      this.cache.set(CacheKeys.userByEmail(snapshot.email), snapshot, CacheTtl.user),
    ]);
  }

  private async invalidateUser(
    id: string,
    previousEmail?: string | null,
    nextEmail?: string,
  ): Promise<void> {
    const keys = [CacheKeys.userById(id)];

    if (previousEmail) {
      keys.push(CacheKeys.userByEmail(previousEmail));
    }

    if (nextEmail && nextEmail !== previousEmail) {
      keys.push(CacheKeys.userByEmail(nextEmail));
    }

    await this.cache.del(...keys);
  }

  private fromSnapshot(snapshot: UserSnapshot): User {
    return User.restore({
      ...snapshot,
      trialEndsAt: requireRevivedDate(snapshot.trialEndsAt, 'trialEndsAt'),
      subscriptionUpdatedAt: reviveDate(snapshot.subscriptionUpdatedAt),
      createdAt: requireRevivedDate(snapshot.createdAt, 'createdAt'),
      updatedAt: requireRevivedDate(snapshot.updatedAt, 'updatedAt'),
    });
  }

  private toDomain(row: UserOrmEntity): User {
    return User.restore({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash,
      cpf: row.cpf,
      platformRole: (row.platformRole as PlatformRole | null) ?? null,
      isActive: row.isActive,
      plan: row.plan as SubscriptionPlan,
      subscriptionStatus: row.subscriptionStatus as SubscriptionStatus,
      trialEndsAt: row.trialEndsAt,
      subscriptionUpdatedAt: row.subscriptionUpdatedAt,
      stripeCustomerId: row.stripeCustomerId ?? null,
      stripeSubscriptionId: row.stripeSubscriptionId ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
