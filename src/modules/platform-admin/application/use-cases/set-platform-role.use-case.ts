import { Injectable } from '@nestjs/common';

import {
  BusinessRuleError,
  ResourceNotFoundError,
} from '../../../../shared/domain/domain-error';
import { PlatformRole } from '../../../auth/domain/enums/platform-role';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import type { PlatformAccountDto } from '../dto/platform-account.dto';
import { PlatformAccountPresenter } from '../presenters/platform-account.presenter';

@Injectable()
export class SetPlatformRoleUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(
    actorId: string,
    targetUserId: string,
    platformRole: PlatformRole | null,
  ): Promise<PlatformAccountDto> {
    if (actorId === targetUserId && platformRole === null) {
      throw new BusinessRuleError('Você não pode remover o próprio papel de dono do sistema.');
    }

    const user = await this.users.findById(targetUserId);

    if (!user) {
      throw new ResourceNotFoundError('Conta não encontrada.');
    }

    const updated = await this.users.save(user.withPlatformRole(platformRole));

    return PlatformAccountPresenter.toResponse(updated);
  }
}
