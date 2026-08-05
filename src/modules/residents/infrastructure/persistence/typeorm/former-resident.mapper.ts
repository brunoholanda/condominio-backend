import type { ResidentSnapshot } from '../../../domain/entities/resident';
import {
  FormerResidentRecord,
  type FormerResidentReason,
} from '../../../domain/entities/former-resident';
import { FormerResidentOrmEntity } from './entities/former-resident.orm-entity';

export class FormerResidentMapper {
  static toOrm(record: FormerResidentRecord): FormerResidentOrmEntity {
    const state = record.toState();
    const row = new FormerResidentOrmEntity();
    row.id = state.id;
    row.condominiumId = state.condominiumId;
    row.unit = state.unit;
    row.sourceResidentId = state.sourceResidentId;
    row.reason = state.reason;
    row.payload = state.payload as unknown as Record<string, unknown>;
    row.supersededAt = state.supersededAt;
    row.retainUntil = state.retainUntil;
    row.supersededByUserId = state.supersededByUserId;
    row.createdAt = state.createdAt;

    return row;
  }

  static toDomain(row: FormerResidentOrmEntity): FormerResidentRecord {
    return FormerResidentRecord.rehydrate({
      id: row.id,
      condominiumId: row.condominiumId,
      unit: row.unit,
      sourceResidentId: row.sourceResidentId,
      reason: row.reason as FormerResidentReason,
      payload: row.payload as unknown as ResidentSnapshot,
      supersededAt: row.supersededAt,
      retainUntil: row.retainUntil,
      supersededByUserId: row.supersededByUserId,
      createdAt: row.createdAt,
    });
  }
}
