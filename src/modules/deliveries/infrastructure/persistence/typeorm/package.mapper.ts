import type { DeepPartial } from 'typeorm';

import type { PackageSnapshot } from '../../../domain/entities/package';
import { Package } from '../../../domain/entities/package';
import type { PackageOrmEntity } from './entities/package.orm-entity';

export class PackageMapper {
  static toDomain(row: PackageOrmEntity): Package {
    const snapshot: PackageSnapshot = {
      id: row.id,
      condominiumId: row.condominiumId,
      unitNumber: row.unitNumber,
      description: row.description,
      carrier: row.carrier,
      status: row.status,
      receivedAt: row.receivedAt,
      receivedByUserId: row.receivedByUserId,
      receivedByEmployeeId: row.receivedByEmployeeId ?? null,
      deliveredAt: row.deliveredAt,
      deliveredByUserId: row.deliveredByUserId,
      deliveredByEmployeeId: row.deliveredByEmployeeId ?? null,
      recipientName: row.recipientName,
      signature: row.signature,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    return Package.restore(snapshot);
  }

  static toPersistence(parcel: Package): DeepPartial<PackageOrmEntity> {
    const snapshot = parcel.toSnapshot();

    return {
      id: snapshot.id,
      condominiumId: snapshot.condominiumId,
      unitNumber: snapshot.unitNumber,
      description: snapshot.description,
      carrier: snapshot.carrier,
      status: snapshot.status,
      receivedAt: snapshot.receivedAt,
      receivedByUserId: snapshot.receivedByUserId,
      receivedByEmployeeId: snapshot.receivedByEmployeeId,
      deliveredAt: snapshot.deliveredAt,
      deliveredByUserId: snapshot.deliveredByUserId,
      deliveredByEmployeeId: snapshot.deliveredByEmployeeId,
      recipientName: snapshot.recipientName,
      signature: snapshot.signature,
      notes: snapshot.notes,
    };
  }
}
