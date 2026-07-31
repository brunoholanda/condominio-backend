import { Injectable } from '@nestjs/common';

import { ResourceConflictError } from '../../../../shared/domain/domain-error';
import { Cpf } from '../../../../shared/domain/value-objects/cpf';
import { ResidentRepository } from '../../domain/repositories/resident.repository';
import type { ResidentResponseDto } from '../dto/resident-response.dto';
import type { UpdateResidentDto } from '../dto/update-resident.dto';
import { ResidentPresenter } from '../presenters/resident.presenter';
import { FindResidentByIdUseCase } from './find-resident-by-id.use-case';

@Injectable()
export class UpdateResidentUseCase {
  constructor(
    private readonly residents: ResidentRepository,
    private readonly findResident: FindResidentByIdUseCase,
  ) {}

  async execute(id: string, input: UpdateResidentDto): Promise<ResidentResponseDto> {
    const current = await this.findResident.getOrFail(id);
    const cpf = Cpf.create(input.cpf);
    const ownerOfCpf = await this.residents.findIdByCpf(cpf.value);

    if (ownerOfCpf && ownerOfCpf !== id) {
      throw new ResourceConflictError(
        `O CPF ${cpf.formatted} já pertence a outro morador cadastrado.`,
      );
    }

    const updated = await this.residents.save(current.withData(input));

    return ResidentPresenter.toResponse(updated);
  }
}
