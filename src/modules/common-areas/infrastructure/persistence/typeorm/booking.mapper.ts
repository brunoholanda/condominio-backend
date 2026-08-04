import type { DeepPartial } from 'typeorm';

import type { BookingSnapshot } from '../../../domain/entities/booking';
import { Booking } from '../../../domain/entities/booking';
import type { BookingOrmEntity } from './entities/booking.orm-entity';

export class BookingMapper {
  static toDomain(row: BookingOrmEntity): Booking {
    const snapshot: BookingSnapshot = {
      id: row.id,
      commonAreaId: row.commonAreaId,
      condominiumId: row.condominiumId,
      unitNumber: row.unitNumber,
      residentAccountId: row.residentAccountId,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      status: row.status,
      costSnapshotCents: row.costSnapshotCents,
      rulesAcceptedAt: row.rulesAcceptedAt,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    return Booking.restore(snapshot);
  }

  static toPersistence(booking: Booking): DeepPartial<BookingOrmEntity> {
    const snapshot = booking.toSnapshot();

    return {
      id: snapshot.id,
      commonAreaId: snapshot.commonAreaId,
      condominiumId: snapshot.condominiumId,
      unitNumber: snapshot.unitNumber,
      residentAccountId: snapshot.residentAccountId,
      startsAt: snapshot.startsAt,
      endsAt: snapshot.endsAt,
      status: snapshot.status,
      costSnapshotCents: snapshot.costSnapshotCents,
      rulesAcceptedAt: snapshot.rulesAcceptedAt,
      notes: snapshot.notes,
    };
  }
}
