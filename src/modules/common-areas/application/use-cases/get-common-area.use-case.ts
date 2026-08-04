import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import type { CommonArea } from '../../domain/entities/common-area';
import { CommonAreaRepository } from '../../domain/repositories/common-area.repository';

@Injectable()
export class GetCommonAreaUseCase {
  constructor(private readonly areas: CommonAreaRepository) {}

  async getOrFail(id: string, condominiumId: string): Promise<CommonArea> {
    const area = await this.areas.findById(id, condominiumId);

    if (!area) {
      throw new ResourceNotFoundError(`Área comum ${id} não encontrada.`);
    }

    return area;
  }
}
