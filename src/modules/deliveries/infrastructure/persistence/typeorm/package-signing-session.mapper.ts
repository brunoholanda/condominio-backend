import type { DeepPartial } from 'typeorm';

import type { PackageSigningSessionSnapshot } from '../../../domain/entities/package-signing-session';
import { PackageSigningSession } from '../../../domain/entities/package-signing-session';
import type { PackageSigningSessionOrmEntity } from './entities/package-signing-session.orm-entity';

export class PackageSigningSessionMapper {
  static toDomain(row: PackageSigningSessionOrmEntity): PackageSigningSession {
    const snapshot: PackageSigningSessionSnapshot = {
      id: row.id,
      packageId: row.packageId,
      token: row.token,
      expiresAt: row.expiresAt,
      consumedAt: row.consumedAt,
      createdAt: row.createdAt,
    };

    return PackageSigningSession.restore(snapshot);
  }

  static toPersistence(
    session: PackageSigningSession,
  ): DeepPartial<PackageSigningSessionOrmEntity> {
    const snapshot = session.toSnapshot();

    return {
      id: snapshot.id,
      packageId: snapshot.packageId,
      token: snapshot.token,
      expiresAt: snapshot.expiresAt,
      consumedAt: snapshot.consumedAt,
      createdAt: snapshot.createdAt,
    };
  }
}
