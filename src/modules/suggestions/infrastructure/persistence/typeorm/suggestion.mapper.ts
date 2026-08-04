import type { DeepPartial } from 'typeorm';

import type { SuggestionSnapshot } from '../../../domain/entities/suggestion';
import { Suggestion } from '../../../domain/entities/suggestion';
import type { SuggestionOrmEntity } from './entities/suggestion.orm-entity';

export class SuggestionMapper {
  static toDomain(row: SuggestionOrmEntity): Suggestion {
    const snapshot: SuggestionSnapshot = {
      id: row.id,
      condominiumId: row.condominiumId,
      unitNumber: row.unitNumber,
      residentId: row.residentId,
      authorName: row.authorName,
      body: row.body,
      status: row.status,
      createdAt: row.createdAt,
    };

    return Suggestion.restore(snapshot);
  }

  static toPersistence(suggestion: Suggestion): DeepPartial<SuggestionOrmEntity> {
    const snapshot = suggestion.toSnapshot();

    return {
      id: snapshot.id,
      condominiumId: snapshot.condominiumId,
      unitNumber: snapshot.unitNumber,
      residentId: snapshot.residentId,
      authorName: snapshot.authorName,
      body: snapshot.body,
      status: snapshot.status,
      createdAt: snapshot.createdAt,
    };
  }
}
