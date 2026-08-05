import { Injectable } from '@nestjs/common';

import { ResidentRepository } from '../../domain/repositories/resident.repository';
import { ArchiveFormerResidentUseCase } from './archive-former-resident.use-case';
import { FindResidentByIdUseCase } from './find-resident-by-id.use-case';

@Injectable()
export class DeleteResidentUseCase {
  constructor(
    private readonly residents: ResidentRepository,
    private readonly findResident: FindResidentByIdUseCase,
    private readonly archiveFormer: ArchiveFormerResidentUseCase,
  ) {}

  async execute(
    id: string,
    condominiumId: string,
    actorUserId: string | null,
  ): Promise<void> {
    const resident = await this.findResident.getOrFail(id, condominiumId);

    await this.archiveFormer.execute(resident, 'DELETE', actorUserId);
    await this.residents.deleteById(resident.id, condominiumId);
  }
}
