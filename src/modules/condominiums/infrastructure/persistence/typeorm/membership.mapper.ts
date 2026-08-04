import type { DeepPartial } from 'typeorm';

import type { MembershipSnapshot } from '../../../domain/entities/membership';
import { Membership } from '../../../domain/entities/membership';
import type { MembershipOrmEntity } from './entities/membership.orm-entity';

export class MembershipMapper {
  static toDomain(row: MembershipOrmEntity): Membership {
    const snapshot: MembershipSnapshot = {
      id: row.id,
      userId: row.userId,
      condominiumId: row.condominiumId,
      role: row.role,
      createdAt: row.createdAt,
    };

    return Membership.restore(snapshot);
  }

  static toPersistence(membership: Membership): DeepPartial<MembershipOrmEntity> {
    const snapshot = membership.toSnapshot();

    return {
      id: snapshot.id,
      userId: snapshot.userId,
      condominiumId: snapshot.condominiumId,
      role: snapshot.role,
    };
  }
}
