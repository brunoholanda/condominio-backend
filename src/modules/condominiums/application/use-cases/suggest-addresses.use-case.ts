import { Injectable } from '@nestjs/common';

import { InvalidFieldError } from '../../../../shared/domain/domain-error';
import type { GeocodeSuggestItemDto } from '../dto/geocode.dto';
import { NominatimClient } from '../services/nominatim.client';

@Injectable()
export class SuggestAddressesUseCase {
  constructor(private readonly nominatim: NominatimClient) {}

  async execute(query: string): Promise<GeocodeSuggestItemDto[]> {
    const q = query.trim();

    if (q.length < 3) {
      throw new InvalidFieldError('endereço', 'Digite pelo menos 3 caracteres para sugerir.');
    }

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
