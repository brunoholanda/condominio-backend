import type { DeepPartial } from 'typeorm';

import { toIsoDate } from '../../../../../shared/application/date-format';
import type { ChargeBatchSnapshot } from '../../../domain/entities/charge-batch';
import { ChargeBatch } from '../../../domain/entities/charge-batch';
import type { ChargeBatchOrmEntity } from './entities/charge-batch.orm-entity';

export class ChargeBatchMapper {
  static toDomain(row: ChargeBatchOrmEntity): ChargeBatch {
    const snapshot: ChargeBatchSnapshot = {
      id: row.id,
      condominiumId: row.condominiumId,
      referenceMonth: new Date(row.referenceMonth),
      description: row.description,
      dueDate: new Date(row.dueDate),
      defaultAmountCents: row.defaultAmountCents,
      createdByUserId: row.createdByUserId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    return ChargeBatch.restore(snapshot);
  }

  static toPersistence(batch: ChargeBatch): DeepPartial<ChargeBatchOrmEntity> {
    const snapshot = batch.toSnapshot();

    return {
      id: snapshot.id,
      condominiumId: snapshot.condominiumId,
      referenceMonth: toIsoDate(snapshot.referenceMonth),
      description: snapshot.description,
      dueDate: toIsoDate(snapshot.dueDate),
      defaultAmountCents: snapshot.defaultAmountCents,
      createdByUserId: snapshot.createdByUserId,
    };
  }
}
