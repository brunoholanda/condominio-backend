import { Injectable } from '@nestjs/common';

import { BusinessRuleError, InvalidFieldError } from '../../../../shared/domain/domain-error';
import type { GeocodeResultDto } from '../dto/geocode.dto';
import { NominatimClient } from '../services/nominatim.client';

@Injectable()
export class GeocodeAddressUseCase {
  constructor(private readonly nominatim: NominatimClient) {}

  async execute(query: string): Promise<GeocodeResultDto> {
    const q = query.trim();

    if (q.length < 3) {
      throw new InvalidFieldError('endereço', 'Informe um endereço com pelo menos 3 caracteres.');
    }

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
