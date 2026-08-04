import type { DeepPartial } from 'typeorm';

import { TimePunch } from '../../../domain/entities/time-punch';
import type { PunchStatus, PunchType } from '../../../domain/enums/staff.enums';
import type { TimePunchOrmEntity } from './entities/time-punch.orm-entity';

function toNumber(value: string | number): number {
  return typeof value === 'number' ? value : Number(value);
}

export class TimePunchMapper {
  static toDomain(row: TimePunchOrmEntity): TimePunch {
    return TimePunch.restore({
      id: row.id,
      condominiumId: row.condominiumId,
      employeeId: row.employeeId,
      type: row.type as PunchType,
      status: row.status as PunchStatus,
      punchedAt: row.punchedAt,
      latitude: toNumber(row.latitude),
      longitude: toNumber(row.longitude),
      accuracyMeters: row.accuracyMeters !== null ? toNumber(row.accuracyMeters) : null,
      distanceMeters: toNumber(row.distanceMeters),
      selfieStorageKey: row.selfieStorageKey,
      selfiePurgedAt: row.selfiePurgedAt ?? null,
      deviceUserAgent: row.deviceUserAgent,
      rejectedReason: row.rejectedReason,
      createdAt: row.createdAt,
    });
  }

  static toPersistence(punch: TimePunch): DeepPartial<TimePunchOrmEntity> {
    const s = punch.toSnapshot();

    return {
      id: s.id,
      condominiumId: s.condominiumId,
      employeeId: s.employeeId,
      type: s.type,
      status: s.status,
      punchedAt: s.punchedAt,
      latitude: String(s.latitude),
      longitude: String(s.longitude),
      accuracyMeters: s.accuracyMeters !== null ? String(s.accuracyMeters) : null,
      distanceMeters: String(s.distanceMeters),
      selfieStorageKey: s.selfieStorageKey,
      selfiePurgedAt: s.selfiePurgedAt,
      deviceUserAgent: s.deviceUserAgent,
      rejectedReason: s.rejectedReason,
    };
  }
}
