import { Injectable } from '@nestjs/common';

import { ResidentRepository } from '../../domain/repositories/resident.repository';
import { FindResidentByIdUseCase } from './find-resident-by-id.use-case';

@Injectable()
export class DeleteResidentUseCase {
  constructor(
    private readonly residents: ResidentRepository,
    private readonly findResident: FindResidentByIdUseCase,
  ) {}

  async execute(id: string): Promise<void> {
    const resident = await this.findResident.getOrFail(id);

    await this.residents.deleteById(resident.id);
  }
}
