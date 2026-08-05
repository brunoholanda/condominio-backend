import { Injectable } from '@nestjs/common';

import { BusinessRuleError, InvalidFieldError } from '../../../../shared/domain/domain-error';
import { CacheStore } from '../../../../shared/application/ports/cache-store';
import { CacheKeys, normalizeGeoQuery } from '../../../../shared/infrastructure/cache/cache-keys';
import { CacheTtl } from '../../../../shared/infrastructure/cache/cache-ttl';
import type { GeocodeResultDto } from '../dto/geocode.dto';
import { NominatimClient } from '../services/nominatim.client';

@Injectable()
export class GeocodeAddressUseCase {
  constructor(
    private readonly nominatim: NominatimClient,
    private readonly cache: CacheStore,
  ) {}

  async execute(query: string): Promise<GeocodeResultDto> {
    const q = query.trim();

    if (q.length < 3) {
      throw new InvalidFieldError('endereço', 'Informe um endereço com pelo menos 3 caracteres.');
    }

    const key = CacheKeys.geocode(normalizeGeoQuery(q));

    return this.cache.getOrSet(key, CacheTtl.geocode, () => this.geocode(q));
  }

  private async geocode(q: string): Promise<GeocodeResultDto> {
    const data = await this.nominatim.search(q, 1);

    if (data.length === 0) {
      throw new BusinessRuleError(
        'Endereço não encontrado. Confira o texto ou informe latitude/longitude manualmente.',
        'GEOCODE_NOT_FOUND',
      );
    }

    const parsed = this.nominatim.parseItem(data[0]);

    if (!Number.isFinite(parsed.latitude) || !Number.isFinite(parsed.longitude)) {
      throw new BusinessRuleError('Resposta inválida do serviço de mapas.');
    }

    return parsed;
  }
}
