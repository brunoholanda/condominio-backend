import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import type { Resident } from '../../domain/entities/resident';
import { ResidentRepository } from '../../domain/repositories/resident.repository';
import type { ResidentResponseDto } from '../dto/resident-response.dto';
import { ResidentPresenter } from '../presenters/resident.presenter';

@Injectable()
export class FindResidentByIdUseCase {
  constructor(private readonly residents: ResidentRepository) {}

  async execute(id: string, condominiumId: string): Promise<ResidentResponseDto> {
    return ResidentPresenter.toResponse(await this.getOrFail(id, condominiumId));
  }

  /** Shared by the use cases that need the aggregate itself instead of its response shape. */
  async getOrFail(id: string, condominiumId: string): Promise<Resident> {
    const resident = await this.residents.findById(id, condominiumId);

    if (!resident) {
      throw new ResourceNotFoundError(`Morador ${id} não encontrado.`);
    }

    return resident;
  }
}
