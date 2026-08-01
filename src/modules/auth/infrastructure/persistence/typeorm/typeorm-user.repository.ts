import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../../domain/entities/user';
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

    return row ? User.restore(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.repository.findOne({ where: { id } });

    return row ? User.restore(row) : null;
  }

  async findIdByCpf(cpf: string): Promise<string | null> {
    const row = await this.repository.findOne({ where: { cpf }, select: { id: true } });

    return row?.id ?? null;
  }

  async save(user: User): Promise<User> {
    const { createdAt: _createdAt, updatedAt: _updatedAt, ...row } = user.toSnapshot();

    await this.repository.save(row);

    const saved = await this.findById(user.id);

    if (!saved) {
      throw new Error(`Falha ao persistir o usuário ${user.id}.`);
    }

    return saved;
  }
}
