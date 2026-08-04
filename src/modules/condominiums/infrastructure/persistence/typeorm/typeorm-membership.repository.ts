import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Membership } from '../../../domain/entities/membership';
import { MembershipRepository } from '../../../domain/repositories/membership.repository';
import { MembershipOrmEntity } from './entities/membership.orm-entity';
import { MembershipMapper } from './membership.mapper';

@Injectable()
export class TypeormMembershipRepository extends MembershipRepository {
  constructor(
    @InjectRepository(MembershipOrmEntity)
    private readonly repository: Repository<MembershipOrmEntity>,
  ) {
    super();
  }

  async save(membership: Membership): Promise<Membership> {
    await this.repository.save(MembershipMapper.toPersistence(membership));

    const row = await this.repository.findOne({ where: { id: membership.id } });

    if (!row) {
      throw new Error(`Falha ao persistir o vínculo ${membership.id}.`);
    }

    return MembershipMapper.toDomain(row);
  }

  async findByUserAndCondo(userId: string, condominiumId: string): Promise<Membership | null> {
    const row = await this.repository.findOne({ where: { userId, condominiumId } });

    return row ? MembershipMapper.toDomain(row) : null;
  }

  async findManyByUser(userId: string): Promise<Membership[]> {
    const rows = await this.repository.find({ where: { userId } });

    return rows.map((row) => MembershipMapper.toDomain(row));
  }

  async findManyByCondo(condominiumId: string): Promise<Membership[]> {
    const rows = await this.repository.find({ where: { condominiumId } });

    return rows.map((row) => MembershipMapper.toDomain(row));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
