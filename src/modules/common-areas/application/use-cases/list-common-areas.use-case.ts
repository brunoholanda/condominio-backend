import { Injectable } from '@nestjs/common';

import { CommonAreaRepository } from '../../domain/repositories/common-area.repository';
import type { CommonAreaResponseDto } from '../dto/common-area-response.dto';
import { CommonAreaPresenter } from '../presenters/common-area.presenter';

@Injectable()
export class ListCommonAreasUseCase {
  constructor(private readonly areas: CommonAreaRepository) {}

  async execute(condominiumId: string, onlyActive = false): Promise<CommonAreaResponseDto[]> {
    const rows = await this.areas.findManyByCondo(condominiumId, onlyActive);

    return rows.map((area) => CommonAreaPresenter.toResponse(area));
  }
}
