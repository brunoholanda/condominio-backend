import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../../domain/entities/user';
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
  ) {
    super();
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.repository.findOne({ where: { email: email.toLowerCase() } });

    return row ? this.toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.repository.findOne({ where: { id } });

    return row ? this.toDomain(row) : null;
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

    const saved = await this.findById(user.id);

    if (!saved) {
      throw new Error(`Falha ao persistir o usuário ${user.id}.`);
    }

    return saved;
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
