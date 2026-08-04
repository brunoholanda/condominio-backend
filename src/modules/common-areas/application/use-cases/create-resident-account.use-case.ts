import { Injectable } from '@nestjs/common';

import {
  ResourceConflictError,
  ResourceNotFoundError,
} from '../../../../shared/domain/domain-error';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { ResidentAccount } from '../../domain/entities/resident-account';
import { ResidentAccountRepository } from '../../domain/repositories/resident-account.repository';
import type { CreateResidentAccountDto } from '../dto/create-resident-account.dto';
import type { ResidentAccountResponseDto } from '../dto/resident-account-response.dto';
import { ResidentAccountPresenter } from '../presenters/resident-account.presenter';

/**
 * Links an already registered user to a unit. There is no invite flow yet: the
 * person must sign up first (`POST /auth/register`) so the manager just points
 * to their e-mail.
 */
@Injectable()
export class CreateResidentAccountUseCase {
  constructor(
    private readonly residentAccounts: ResidentAccountRepository,
    private readonly users: UserRepository,
  ) {}

  async execute(
    input: CreateResidentAccountDto,
    condominiumId: string,
  ): Promise<ResidentAccountResponseDto> {
    const user = await this.users.findByEmail(input.email.trim().toLowerCase());

    if (!user) {
      throw new ResourceNotFoundError(
        'Nenhuma conta encontrada com este e-mail. Peça para a pessoa se cadastrar antes.',
      );
    }

    const existing = await this.residentAccounts.findByUserAndCondo(user.id, condominiumId);

    if (existing) {
      throw new ResourceConflictError('Esta pessoa já tem acesso de morador neste condomínio.');
    }

    const account = await this.residentAccounts.save(
      ResidentAccount.create({ userId: user.id, condominiumId, unitNumber: input.unitNumber }),
    );

    return ResidentAccountPresenter.toResponse(account);
  }
}
