import { Injectable } from '@nestjs/common';

import { AuthenticationError } from '../../../../shared/domain/domain-error';
import { UserRepository } from '../../domain/repositories/user.repository';
import type { AuthenticatedUserDto } from '../dto/auth-response.dto';
import { UserPresenter } from '../presenters/user.presenter';

@Injectable()
export class GetAuthenticatedUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string): Promise<AuthenticatedUserDto> {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new AuthenticationError('Sessão inválida. Faça login novamente.');
    }

    return UserPresenter.toResponse(user);
  }
}
