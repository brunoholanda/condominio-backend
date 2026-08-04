import { Injectable } from '@nestjs/common';

import { CommonAreaRepository } from '../../domain/repositories/common-area.repository';
import { GetCommonAreaUseCase } from './get-common-area.use-case';

@Injectable()
export class DeleteCommonAreaUseCase {
  constructor(
    private readonly areas: CommonAreaRepository,
    private readonly getCommonArea: GetCommonAreaUseCase,
  ) {}

  async execute(id: string, condominiumId: string): Promise<void> {
    await this.getCommonArea.getOrFail(id, condominiumId);
    await this.areas.delete(id, condominiumId);
  }
}
