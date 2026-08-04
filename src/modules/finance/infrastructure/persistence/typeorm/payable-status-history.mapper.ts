import type { DeepPartial } from 'typeorm';

import type { PayableStatusHistorySnapshot } from '../../../domain/entities/payable-status-history';
import { PayableStatusHistory } from '../../../domain/entities/payable-status-history';
import type { PayableStatusHistoryOrmEntity } from './entities/payable-status-history.orm-entity';

export class PayableStatusHistoryMapper {
  static toDomain(row: PayableStatusHistoryOrmEntity): PayableStatusHistory {
    const snapshot: PayableStatusHistorySnapshot = {
      id: row.id,
      payableId: row.payableId,
      fromStatus: row.fromStatus,
      toStatus: row.toStatus,
      changedByUserId: row.changedByUserId,
      changedAt: row.changedAt,
      note: row.note,
    };

    return PayableStatusHistory.restore(snapshot);
  }

  static toPersistence(entry: PayableStatusHistory): DeepPartial<PayableStatusHistoryOrmEntity> {
    return { ...entry.toSnapshot() };
  }
}
