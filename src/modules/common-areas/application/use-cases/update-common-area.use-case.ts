import { Injectable } from '@nestjs/common';

import { CommonAreaRepository } from '../../domain/repositories/common-area.repository';
import type { CommonAreaResponseDto } from '../dto/common-area-response.dto';
import type { UpdateCommonAreaDto } from '../dto/update-common-area.dto';
import { CommonAreaPresenter } from '../presenters/common-area.presenter';
import { GetCommonAreaUseCase } from './get-common-area.use-case';

@Injectable()
export class UpdateCommonAreaUseCase {
  constructor(
    private readonly areas: CommonAreaRepository,
    private readonly getCommonArea: GetCommonAreaUseCase,
  ) {}

  async execute(
    id: string,
    input: UpdateCommonAreaDto,
    condominiumId: string,
  ): Promise<CommonAreaResponseDto> {
    const current = await this.getCommonArea.getOrFail(id, condominiumId);
    const updated = await this.areas.save(current.withData({ ...input, condominiumId }));

    return CommonAreaPresenter.toResponse(updated);
  }
}
