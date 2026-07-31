import { Injectable } from '@nestjs/common';

import { ResourceConflictError } from '../../../../shared/domain/domain-error';
import { Cpf } from '../../../../shared/domain/value-objects/cpf';
import { Resident } from '../../domain/entities/resident';
import { ResidentRepository } from '../../domain/repositories/resident.repository';
import type { CreateResidentDto } from '../dto/create-resident.dto';
import type { ResidentResponseDto } from '../dto/resident-response.dto';
import { ResidentPresenter } from '../presenters/resident.presenter';

@Injectable()
export class CreateResidentUseCase {
  constructor(private readonly residents: ResidentRepository) {}

  async execute(input: CreateResidentDto): Promise<ResidentResponseDto> {
    const cpf = Cpf.create(input.cpf);
    const existingId = await this.residents.findIdByCpf(cpf.value);

    if (existingId) {
      throw new ResourceConflictError(
        `Já existe um morador cadastrado com o CPF ${cpf.formatted}.`,
      );
    }

    const resident = await this.residents.save(Resident.create(input));

    return ResidentPresenter.toResponse(resident);
  }
}
