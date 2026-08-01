import { Injectable } from '@nestjs/common';

import { ResourceConflictError } from '../../../../shared/domain/domain-error';
import { Cpf } from '../../../../shared/domain/value-objects/cpf';
import { Resident } from '../../domain/entities/resident';
import { ResidentRepository } from '../../domain/repositories/resident.repository';
import { Unit } from '../../domain/value-objects/unit';
import type { CreateResidentDto } from '../dto/create-resident.dto';
import type { ResidentResponseDto } from '../dto/resident-response.dto';
import { ResidentPresenter } from '../presenters/resident.presenter';

@Injectable()
export class CreateResidentUseCase {
  constructor(private readonly residents: ResidentRepository) {}

  async execute(input: CreateResidentDto): Promise<ResidentResponseDto> {
    const cpf = Cpf.create(input.cpf);
    const unit = Unit.create(input.unit);

    const [ownerOfCpf, ownerOfUnit] = await Promise.all([
      this.residents.findIdByCpf(cpf.value),
      this.residents.findIdByUnit(unit.value),
    ]);

    // O cadastro é público: confirmar o CPF na resposta permitiria descobrir
    // quem mora aqui testando números, então a mensagem não repete o valor.
    if (ownerOfCpf) {
      throw new ResourceConflictError('Já existe um morador cadastrado com o CPF informado.');
    }

    if (ownerOfUnit) {
      throw new ResourceConflictError(
        `A unidade ${unit.value} já possui um formulário preenchido, e ele vale para todos os moradores do apartamento. Se algum dado mudou ou falta alguém, procure a administração para atualizá-lo.`,
      );
    }

    const resident = await this.residents.save(Resident.create(input));

    return ResidentPresenter.toResponse(resident);
  }
}
