import { Injectable } from '@nestjs/common';

import {
  BusinessRuleError,
  ResourceNotFoundError,
} from '../../../../shared/domain/domain-error';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import type { PlatformAccountDto } from '../dto/platform-account.dto';
import { PlatformAccountPresenter } from '../presenters/platform-account.presenter';

@Injectable()
export class SetAccountActiveUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(
    actorId: string,
    targetUserId: string,
    active: boolean,
  ): Promise<PlatformAccountDto> {
    if (actorId === targetUserId && !active) {
      throw new BusinessRuleError('Você não pode desativar a própria conta.');
    }

    const user = await this.users.findById(targetUserId);

    if (!user) {
      throw new ResourceNotFoundError('Conta não encontrada.');
    }

    const updated = active ? user.activate() : user.deactivate();

    return PlatformAccountPresenter.toResponse(await this.users.save(updated));
  }
}
