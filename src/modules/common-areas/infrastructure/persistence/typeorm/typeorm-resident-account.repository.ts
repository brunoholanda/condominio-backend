import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { ResidentAccount } from '../../../domain/entities/resident-account';
import { ResidentAccountRepository } from '../../../domain/repositories/resident-account.repository';
import { ResidentAccountOrmEntity } from './entities/resident-account.orm-entity';
import { ResidentAccountMapper } from './resident-account.mapper';

@Injectable()
export class TypeormResidentAccountRepository extends ResidentAccountRepository {
  constructor(
    @InjectRepository(ResidentAccountOrmEntity)
    private readonly repository: Repository<ResidentAccountOrmEntity>,
  ) {
    super();
  }

  async save(account: ResidentAccount): Promise<ResidentAccount> {
    await this.repository.save(ResidentAccountMapper.toPersistence(account));

    const row = await this.repository.findOne({ where: { id: account.id } });

    if (!row) {
      throw new Error(`Falha ao persistir a conta do morador ${account.id}.`);
    }

    return ResidentAccountMapper.toDomain(row);
  }

  async findByUserAndCondo(userId: string, condominiumId: string): Promise<ResidentAccount | null> {
    const row = await this.repository.findOne({ where: { userId, condominiumId } });

    return row ? ResidentAccountMapper.toDomain(row) : null;
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
    await this.repository.delete({ id });
  }
}
