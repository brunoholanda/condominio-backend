import type { DeepPartial } from 'typeorm';

import type { CommonAreaSnapshot } from '../../../domain/entities/common-area';
import { CommonArea } from '../../../domain/entities/common-area';
import type { CommonAreaOrmEntity } from './entities/common-area.orm-entity';

export class CommonAreaMapper {
  static toDomain(row: CommonAreaOrmEntity): CommonArea {
    const snapshot: CommonAreaSnapshot = {
      id: row.id,
      condominiumId: row.condominiumId,
      name: row.name,
      description: row.description,
      rules: row.rules,
      costCents: row.costCents,
      capacity: row.capacity,
      active: row.active,
      autoApprove: row.autoApprove,
      minAdvanceHours: row.minAdvanceHours,
      cancelBeforeHours: row.cancelBeforeHours,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    return CommonArea.restore(snapshot);
  }

  static toPersistence(area: CommonArea): DeepPartial<CommonAreaOrmEntity> {
    const snapshot = area.toSnapshot();

    return {
      id: snapshot.id,
      condominiumId: snapshot.condominiumId,
      name: snapshot.name,
      description: snapshot.description,
      rules: snapshot.rules,
      costCents: snapshot.costCents,
      capacity: snapshot.capacity,
      active: snapshot.active,
      autoApprove: snapshot.autoApprove,
      minAdvanceHours: snapshot.minAdvanceHours,
      cancelBeforeHours: snapshot.cancelBeforeHours,
    };
  }
}
