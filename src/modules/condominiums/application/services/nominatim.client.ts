import { Injectable, Logger } from '@nestjs/common';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';

export interface NominatimAddress {
  road?: string;
  pedestrian?: string;
  residential?: string;
  footway?: string;
  house_number?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  quarter?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  'ISO3166-2-lvl4'?: string;
  postcode?: string;
}

export interface NominatimItem {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
}

export interface ParsedAddressParts {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  address: string;
  displayName: string;
  latitude: number;
  longitude: number;
}

const UF_BY_STATE: Record<string, string> = {
  acre: 'AC',
  alagoas: 'AL',
  amapá: 'AP',
  amapa: 'AP',
  amazonas: 'AM',
  bahia: 'BA',
  ceará: 'CE',
  ceara: 'CE',
  'distrito federal': 'DF',
  'espírito santo': 'ES',
  'espirito santo': 'ES',
  goiás: 'GO',
  goias: 'GO',
  maranhão: 'MA',
  maranhao: 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  pará: 'PA',
  para: 'PA',
  paraíba: 'PB',
  paraiba: 'PB',
  paraná: 'PR',
  parana: 'PR',
  pernambuco: 'PE',
  piauí: 'PI',
  piaui: 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  rondônia: 'RO',
  rondonia: 'RO',
  roraima: 'RR',
  'santa catarina': 'SC',
  'são paulo': 'SP',
  'sao paulo': 'SP',
  sergipe: 'SE',
  tocantins: 'TO',
};

@Injectable()
export class NominatimClient {
  private readonly logger = new Logger(NominatimClient.name);

  async search(query: string, limit: number): Promise<NominatimItem[]> {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('countrycodes', 'br');
    url.searchParams.set('addressdetails', '1');

    let response: Response;

    try {
      response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'CondoGest/1.0 (condominio-app; geocode)',
        },
        signal: AbortSignal.timeout(12_000),
      });
    } catch (error) {
      this.logger.warn(`Falha ao consultar Nominatim: ${String(error)}`);
      throw new BusinessRuleError(
        'Não foi possível consultar o serviço de mapas. Tente novamente em instantes.',
      );
    }

    if (!response.ok) {
      throw new BusinessRuleError(
        'Serviço de mapas indisponível no momento. Preencha as coordenadas manualmente.',
      );
    }

    const data = (await response.json()) as NominatimItem[];

    return Array.isArray(data) ? data : [];
  }

  parseItem(item: NominatimItem): ParsedAddressParts {
    const latitude = Number(item.lat);
    const longitude = Number(item.lon);
    const parts = this.mapAddress(item.address);
    const address = this.formatAddress(parts) || item.display_name.slice(0, 255);

    return {
      ...parts,
      address: address.slice(0, 255),
      displayName: item.display_name,
      latitude: Math.round(latitude * 1e7) / 1e7,
      longitude: Math.round(longitude * 1e7) / 1e7,
    };
  }

  formatAddress(parts: {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }): string {
    const line1 = [parts.street, parts.number].filter(Boolean).join(', ');
    const cityUf = [parts.city, parts.state].filter(Boolean).join(' - ');
    const mid = [parts.neighborhood, cityUf].filter(Boolean).join(', ');
    const cep = parts.zipCode ? `CEP ${parts.zipCode}` : '';

    return [line1, mid, cep].filter(Boolean).join(' — ').slice(0, 255);
  }

  formatZipCode(raw?: string): string | undefined {
    if (!raw) return undefined;
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    if (digits.length !== 8) return raw.slice(0, 9);
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  private mapAddress(address?: NominatimAddress) {
    if (!address) return {};

    const street = address.road || address.pedestrian || address.residential || address.footway;
    const neighborhood =
      address.suburb || address.neighbourhood || address.city_district || address.quarter;
    const city = address.city || address.town || address.village || address.municipality;
    const state = this.toUf(address);

    return {
      street: street?.trim() || undefined,
      number: address.house_number?.trim() || undefined,
      neighborhood: neighborhood?.trim() || undefined,
      city: city?.trim() || undefined,
      state,
      zipCode: this.formatZipCode(address.postcode),
    };
  }

  private toUf(address: NominatimAddress): string | undefined {
    const iso = address['ISO3166-2-lvl4'];
    if (iso?.includes('-')) {
      const uf = iso.split('-')[1]?.toUpperCase();
      if (uf && uf.length === 2) return uf;
    }

    const state = address.state?.trim();
    if (!state) return undefined;
    if (state.length === 2) return state.toUpperCase();

    return UF_BY_STATE[state.toLowerCase()] ?? state.slice(0, 2).toUpperCase();
  }
}
