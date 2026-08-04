import { Injectable } from '@nestjs/common';

import { CommonArea } from '../../domain/entities/common-area';
import { CommonAreaRepository } from '../../domain/repositories/common-area.repository';
import type { CommonAreaResponseDto } from '../dto/common-area-response.dto';
import type { CreateCommonAreaDto } from '../dto/create-common-area.dto';
import { CommonAreaPresenter } from '../presenters/common-area.presenter';

@Injectable()
export class CreateCommonAreaUseCase {
  constructor(private readonly areas: CommonAreaRepository) {}

  async execute(input: CreateCommonAreaDto, condominiumId: string): Promise<CommonAreaResponseDto> {
    const area = await this.areas.save(CommonArea.create({ ...input, condominiumId }));

    return CommonAreaPresenter.toResponse(area);
  }
}
