import type { DeepPartial } from 'typeorm';

import type { UsefulContactSnapshot } from '../../../domain/entities/useful-contact';
import { UsefulContact } from '../../../domain/entities/useful-contact';
import type { UsefulContactOrmEntity } from './entities/useful-contact.orm-entity';

export class UsefulContactMapper {
  static toDomain(row: UsefulContactOrmEntity): UsefulContact {
    const snapshot: UsefulContactSnapshot = {
      id: row.id,
      condominiumId: row.condominiumId,
      label: row.label,
      phone: row.phone,
      url: row.url,
      category: row.category,
      sortOrder: row.sortOrder,
      createdAt: row.createdAt,
    };

    return UsefulContact.restore(snapshot);
  }

  static toPersistence(contact: UsefulContact): DeepPartial<UsefulContactOrmEntity> {
    const snapshot = contact.toSnapshot();

    return {
      id: snapshot.id,
      condominiumId: snapshot.condominiumId,
      label: snapshot.label,
      phone: snapshot.phone,
      url: snapshot.url,
      category: snapshot.category,
      sortOrder: snapshot.sortOrder,
    };
  }
}
