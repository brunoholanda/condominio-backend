import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { UsefulContact } from '../../../domain/entities/useful-contact';
import { UsefulContactRepository } from '../../../domain/repositories/useful-contact.repository';
import { UsefulContactOrmEntity } from './entities/useful-contact.orm-entity';
import { UsefulContactMapper } from './useful-contact.mapper';

@Injectable()
export class TypeormUsefulContactRepository extends UsefulContactRepository {
  constructor(
    @InjectRepository(UsefulContactOrmEntity)
    private readonly repository: Repository<UsefulContactOrmEntity>,
  ) {
    super();
  }

  async save(contact: UsefulContact): Promise<UsefulContact> {
    await this.repository.save(UsefulContactMapper.toPersistence(contact));

    const saved = await this.findById(contact.id, contact.toSnapshot().condominiumId);

    if (!saved) {
      throw new Error(`Falha ao persistir o contato ${contact.id}.`);
    }

    return saved;
  }

  async findById(id: string, condominiumId: string): Promise<UsefulContact | null> {
    const row = await this.repository.findOne({ where: { id, condominiumId } });

    return row ? UsefulContactMapper.toDomain(row) : null;
  }

  async findManyByCondo(condominiumId: string): Promise<UsefulContact[]> {
    const rows = await this.repository.find({
      where: { condominiumId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    return rows.map((row) => UsefulContactMapper.toDomain(row));
  }

  async delete(id: string, condominiumId: string): Promise<void> {
    await this.repository.delete({ id, condominiumId });
  }

  async reorder(condominiumId: string, orderedIds: string[]): Promise<void> {
    await Promise.all(
      orderedIds.map((id, index) =>
        this.repository.update({ id, condominiumId }, { sortOrder: index }),
      ),
    );
  }
}
