import type { DeepPartial } from 'typeorm';

import { toIsoDate } from '../../../../../shared/application/date-format';
import type { PayableSnapshot } from '../../../domain/entities/payable';
import { Payable } from '../../../domain/entities/payable';
import type { PayableOrmEntity } from './entities/payable.orm-entity';

export class PayableMapper {
  static toDomain(row: PayableOrmEntity): Payable {
    const snapshot: PayableSnapshot = {
      id: row.id,
      condominiumId: row.condominiumId,
      description: row.description,
      vendor: row.vendor,
      category: row.category,
      amountCents: row.amountCents,
      dueDate: new Date(row.dueDate),
      notes: row.notes,
      status: row.status,
      paidAt: row.paidAt,
      createdByUserId: row.createdByUserId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    return Payable.restore(snapshot);
  }

  static toPersistence(payable: Payable): DeepPartial<PayableOrmEntity> {
    const snapshot = payable.toSnapshot();

    return {
      id: snapshot.id,
      condominiumId: snapshot.condominiumId,
      description: snapshot.description,
      vendor: snapshot.vendor,
      category: snapshot.category,
      amountCents: snapshot.amountCents,
      dueDate: toIsoDate(snapshot.dueDate),
      notes: snapshot.notes,
      status: snapshot.status,
      paidAt: snapshot.paidAt,
      createdByUserId: snapshot.createdByUserId,
    };
  }
}
