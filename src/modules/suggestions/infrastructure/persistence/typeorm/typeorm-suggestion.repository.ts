import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Suggestion } from '../../../domain/entities/suggestion';
import type { SuggestionStatus } from '../../../domain/enums/suggestion-status';
import { SuggestionRepository } from '../../../domain/repositories/suggestion.repository';
import { SuggestionOrmEntity } from './entities/suggestion.orm-entity';
import { SuggestionMapper } from './suggestion.mapper';

@Injectable()
export class TypeormSuggestionRepository extends SuggestionRepository {
  constructor(
    @InjectRepository(SuggestionOrmEntity)
    private readonly repository: Repository<SuggestionOrmEntity>,
  ) {
    super();
  }

  async save(suggestion: Suggestion): Promise<Suggestion> {
    await this.repository.save(SuggestionMapper.toPersistence(suggestion));

    const row = await this.repository.findOne({
      where: { id: suggestion.id, condominiumId: suggestion.condominiumId },
    });

    if (!row) {
      throw new Error(`Falha ao persistir a sugestão ${suggestion.id}.`);
    }

    return SuggestionMapper.toDomain(row);
  }

  async findById(id: string, condominiumId: string): Promise<Suggestion | null> {
    const row = await this.repository.findOne({ where: { id, condominiumId } });

    return row ? SuggestionMapper.toDomain(row) : null;
  }

  async findManyByCondo(
    condominiumId: string,
    status?: SuggestionStatus,
  ): Promise<Suggestion[]> {
    const rows = await this.repository.find({
      where: status ? { condominiumId, status } : { condominiumId },
      order: { createdAt: 'DESC' },
    });

    return rows.map((row) => SuggestionMapper.toDomain(row));
  }
}
