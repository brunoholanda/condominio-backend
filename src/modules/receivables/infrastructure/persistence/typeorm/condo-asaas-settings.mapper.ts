import type { DeepPartial } from 'typeorm';

import type { CondoAsaasSettingsSnapshot } from '../../../domain/entities/condo-asaas-settings';
import { CondoAsaasSettings } from '../../../domain/entities/condo-asaas-settings';
import type { CondoAsaasSettingsOrmEntity } from './entities/condo-asaas-settings.orm-entity';

export class CondoAsaasSettingsMapper {
  static toDomain(row: CondoAsaasSettingsOrmEntity): CondoAsaasSettings {
    const snapshot: CondoAsaasSettingsSnapshot = {
      id: row.id,
      condominiumId: row.condominiumId,
      apiKey: row.apiKey,
      walletId: row.walletId,
      enabled: row.enabled,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    return CondoAsaasSettings.restore(snapshot);
  }

  static toPersistence(settings: CondoAsaasSettings): DeepPartial<CondoAsaasSettingsOrmEntity> {
    const snapshot = settings.toSnapshot();

    return {
      id: snapshot.id,
      condominiumId: snapshot.condominiumId,
      apiKey: snapshot.apiKey,
      walletId: snapshot.walletId,
      enabled: snapshot.enabled,
    };
  }
}
