import { Injectable } from '@nestjs/common';

import { AuthenticationError, ResourceConflictError } from '../../../../shared/domain/domain-error';
import { Cpf } from '../../../../shared/domain/value-objects/cpf';
import { UserRepository } from '../../domain/repositories/user.repository';
import type { AuthenticatedUserDto } from '../dto/auth-response.dto';
import type { IdentifyOperatorDto } from '../dto/identify-operator.dto';
import { UserPresenter } from '../presenters/user.presenter';

/**
 * Liga a conta a uma pessoa de carne e osso: sem CPF não há a quem imputar o
 * tratamento dos dados dos moradores exigido pela LGPD.
 */
@Injectable()
export class IdentifyOperatorUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string, input: IdentifyOperatorDto): Promise<AuthenticatedUserDto> {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new AuthenticationError('Sessão inválida. Faça login novamente.');
    }

    const cpf = Cpf.create(input.cpf, 'CPF do operador');
    const owner = await this.users.findIdByCpf(cpf.value);

    if (owner && owner !== userId) {
      throw new ResourceConflictError('Este CPF já responde por outra conta de acesso.');
    }

    const identified = await this.users.save(user.identify(cpf.value));

    return UserPresenter.toResponse(identified);
  }
}
