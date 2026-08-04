import type { CondoAsaasSettings } from '../entities/condo-asaas-settings';

export abstract class CondoAsaasSettingsRepository {
  abstract save(settings: CondoAsaasSettings): Promise<CondoAsaasSettings>;

  abstract findByCondominiumId(condominiumId: string): Promise<CondoAsaasSettings | null>;
}
