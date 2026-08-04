import type { DeepPartial } from 'typeorm';

import type { ChargeStatusHistorySnapshot } from '../../../domain/entities/charge-status-history';
import { ChargeStatusHistory } from '../../../domain/entities/charge-status-history';
import type { ChargeStatusHistoryOrmEntity } from './entities/charge-status-history.orm-entity';

export class ChargeStatusHistoryMapper {
  static toDomain(row: ChargeStatusHistoryOrmEntity): ChargeStatusHistory {
    const snapshot: ChargeStatusHistorySnapshot = {
      id: row.id,
      chargeId: row.chargeId,
      fromStatus: row.fromStatus,
      toStatus: row.toStatus,
      changedByUserId: row.changedByUserId,
      note: row.note,
      changedAt: row.changedAt,
    };

    return ChargeStatusHistory.restore(snapshot);
  }

  static toPersistence(entry: ChargeStatusHistory): DeepPartial<ChargeStatusHistoryOrmEntity> {
    const snapshot = entry.toSnapshot();

    return {
      id: snapshot.id,
      chargeId: snapshot.chargeId,
      fromStatus: snapshot.fromStatus,
      toStatus: snapshot.toStatus,
      changedByUserId: snapshot.changedByUserId,
      note: snapshot.note,
      changedAt: snapshot.changedAt,
    };
  }
}
