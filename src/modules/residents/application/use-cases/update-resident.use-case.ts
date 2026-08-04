import { Injectable } from '@nestjs/common';

import { ResourceConflictError } from '../../../../shared/domain/domain-error';
import { Cpf } from '../../../../shared/domain/value-objects/cpf';
import { ResidentRepository } from '../../domain/repositories/resident.repository';
import { Unit } from '../../domain/value-objects/unit';
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

  async execute(
    id: string,
    input: UpdateResidentDto,
    condominiumId: string,
  ): Promise<ResidentResponseDto> {
    const current = await this.findResident.getOrFail(id, condominiumId);
    const cpf = Cpf.create(input.cpf);
    const unit = Unit.create(input.unit);

    const [ownerOfCpf, ownerOfUnit] = await Promise.all([
      this.residents.findIdByCpf(cpf.value, condominiumId),
      this.residents.findIdByUnit(unit.value, condominiumId),
    ]);

    if (ownerOfCpf && ownerOfCpf !== id) {
      throw new ResourceConflictError('O CPF informado já pertence a outro morador cadastrado.');
    }

    if (ownerOfUnit && ownerOfUnit !== id) {
      throw new ResourceConflictError(`A unidade ${unit.value} já pertence a outro cadastro.`);
    }

    const updated = await this.residents.save(current.withData({ ...input, condominiumId }));

    return ResidentPresenter.toResponse(updated);
  }
}
