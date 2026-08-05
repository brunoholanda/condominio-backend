import { Injectable } from '@nestjs/common';

import { InvalidFieldError } from '../../../../shared/domain/domain-error';
import { CacheStore } from '../../../../shared/application/ports/cache-store';
import { CacheKeys, normalizeGeoQuery } from '../../../../shared/infrastructure/cache/cache-keys';
import { CacheTtl } from '../../../../shared/infrastructure/cache/cache-ttl';
import type { GeocodeSuggestItemDto } from '../dto/geocode.dto';
import { NominatimClient } from '../services/nominatim.client';

@Injectable()
export class SuggestAddressesUseCase {
  constructor(
    private readonly nominatim: NominatimClient,
    private readonly cache: CacheStore,
  ) {}

  async execute(query: string): Promise<GeocodeSuggestItemDto[]> {
    const q = query.trim();

    if (q.length < 3) {
      throw new InvalidFieldError('endereço', 'Digite pelo menos 3 caracteres para sugerir.');
    }

    const key = CacheKeys.geoSuggest(normalizeGeoQuery(q));

    return this.cache.getOrSet(key, CacheTtl.geocode, () => this.suggest(q));
  }

  private async suggest(q: string): Promise<GeocodeSuggestItemDto[]> {
    const data = await this.nominatim.search(q, 6);
    const results: GeocodeSuggestItemDto[] = [];

    for (const item of data) {
      const parsed = this.nominatim.parseItem(item);

      if (!Number.isFinite(parsed.latitude) || !Number.isFinite(parsed.longitude)) {
        continue;
      }

      results.push({
        displayName: parsed.displayName,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        address: parsed.address,
        street: parsed.street,
        number: parsed.number,
        neighborhood: parsed.neighborhood,
        city: parsed.city,
        state: parsed.state,
        zipCode: parsed.zipCode,
      });
    }

    return results;
  }
}
