import type { DeepPartial } from 'typeorm';

import type { ResidentAccountSnapshot } from '../../../domain/entities/resident-account';
import { ResidentAccount } from '../../../domain/entities/resident-account';
import type { ResidentAccountOrmEntity } from './entities/resident-account.orm-entity';

export class ResidentAccountMapper {
  static toDomain(row: ResidentAccountOrmEntity): ResidentAccount {
    const snapshot: ResidentAccountSnapshot = {
      id: row.id,
      userId: row.userId,
      condominiumId: row.condominiumId,
      unitNumber: row.unitNumber,
      createdAt: row.createdAt,
    };

    return ResidentAccount.restore(snapshot);
  }

  static toPersistence(account: ResidentAccount): DeepPartial<ResidentAccountOrmEntity> {
    const snapshot = account.toSnapshot();

    return {
      id: snapshot.id,
      userId: snapshot.userId,
      condominiumId: snapshot.condominiumId,
      unitNumber: snapshot.unitNumber,
    };
  }
}
