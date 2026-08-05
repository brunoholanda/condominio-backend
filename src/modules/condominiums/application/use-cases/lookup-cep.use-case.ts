import { Injectable, Logger } from '@nestjs/common';

import { BusinessRuleError, InvalidFieldError } from '../../../../shared/domain/domain-error';
import { CacheStore } from '../../../../shared/application/ports/cache-store';
import { CacheKeys } from '../../../../shared/infrastructure/cache/cache-keys';
import { CacheTtl } from '../../../../shared/infrastructure/cache/cache-ttl';
import type { GeocodeResultDto } from '../dto/geocode.dto';
import { NominatimClient } from '../services/nominatim.client';

interface ViaCepResponse {
  erro?: boolean | string;
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
}

/** Busca endereço pelo CEP (ViaCEP) e tenta obter lat/lng via Nominatim. */
@Injectable()
export class LookupCepUseCase {
  private readonly logger = new Logger(LookupCepUseCase.name);

  constructor(
    private readonly nominatim: NominatimClient,
    private readonly cache: CacheStore,
  ) {}

  async execute(rawCep: string): Promise<GeocodeResultDto> {
    const cep = rawCep.replace(/\D/g, '');

    if (cep.length !== 8) {
      throw new InvalidFieldError('CEP', 'Informe um CEP válido com 8 dígitos.');
    }

    return this.cache.getOrSet(CacheKeys.cep(cep), CacheTtl.cep, () => this.lookup(cep));
  }

  private async lookup(cep: string): Promise<GeocodeResultDto> {
    let viaCep: ViaCepResponse;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        throw new BusinessRuleError('Serviço de CEP indisponível no momento.');
      }

      viaCep = (await response.json()) as ViaCepResponse;
    } catch (error) {
      if (error instanceof BusinessRuleError) throw error;
      this.logger.warn(`Falha ao consultar ViaCEP: ${String(error)}`);
      throw new BusinessRuleError('Não foi possível consultar o CEP. Tente novamente.');
    }

    if (viaCep.erro === true || viaCep.erro === 'true' || !viaCep.localidade) {
      throw new BusinessRuleError('CEP não encontrado.', 'CEP_NOT_FOUND');
    }

    const street = viaCep.logradouro?.trim() || undefined;
    const neighborhood = viaCep.bairro?.trim() || undefined;
    const city = viaCep.localidade?.trim() || undefined;
    const state = viaCep.uf?.trim().toUpperCase() || undefined;
    const zipCode = this.nominatim.formatZipCode(viaCep.cep || cep);
    const address = this.nominatim.formatAddress({
      street,
      neighborhood,
      city,
      state,
      zipCode,
    });

    const queryParts = [street, neighborhood, city, state, 'Brasil'].filter(Boolean);
    let latitude = 0;
    let longitude = 0;
    let displayName = address;

    try {
      const hits = await this.nominatim.search(queryParts.join(', '), 1);

      if (hits.length > 0) {
        const parsed = this.nominatim.parseItem(hits[0]);
        latitude = parsed.latitude;
        longitude = parsed.longitude;
        displayName = parsed.displayName;
      }
    } catch (error) {
      this.logger.warn(`CEP ok, mas geocode falhou: ${String(error)}`);
    }

    return {
      displayName,
      latitude,
      longitude,
      address,
      street,
      neighborhood,
      city,
      state,
      zipCode,
    };
  }
}
