import type { DeepPartial } from 'typeorm';

import { toIsoDate } from '../../../../../shared/application/date-format';
import type { CondominiumSnapshot } from '../../../domain/entities/condominium';
import { Condominium } from '../../../domain/entities/condominium';
import { normalizePublicHubLinks } from '../../../domain/public-qr-target';
import type { CondominiumOrmEntity } from './entities/condominium.orm-entity';

function toNumberOrNull(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const num = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(num) ? num : null;
}

/** Translates between the persistence row (+ its units) and the aggregate. */
export class CondominiumMapper {
  static toDomain(row: CondominiumOrmEntity, unitNumbers: string[]): Condominium {
    const snapshot: CondominiumSnapshot = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      unitNumbers,
      buildingHandoverDate: row.buildingHandoverDate ? new Date(row.buildingHandoverDate) : null,
      publicHubLinks: normalizePublicHubLinks(row.publicHubLinks),
      address: row.address,
      latitude: toNumberOrNull(row.latitude),
      longitude: toNumberOrNull(row.longitude),
      geofenceRadiusMeters: row.geofenceRadiusMeters,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    return Condominium.restore(snapshot);
  }

  static toPersistence(condominium: Condominium): DeepPartial<CondominiumOrmEntity> {
    const snapshot = condominium.toSnapshot();

    return {
      id: snapshot.id,
      name: snapshot.name,
      slug: snapshot.slug,
      buildingHandoverDate: snapshot.buildingHandoverDate
        ? toIsoDate(snapshot.buildingHandoverDate)
        : null,
      publicHubLinks: snapshot.publicHubLinks,
      address: snapshot.address,
      latitude: snapshot.latitude !== null ? String(snapshot.latitude) : null,
      longitude: snapshot.longitude !== null ? String(snapshot.longitude) : null,
      geofenceRadiusMeters: snapshot.geofenceRadiusMeters,
    };
  }
}
