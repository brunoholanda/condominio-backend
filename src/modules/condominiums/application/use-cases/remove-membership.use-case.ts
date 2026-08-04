import { Injectable } from '@nestjs/common';

import {
  BusinessRuleError,
  ResourceNotFoundError,
} from '../../../../shared/domain/domain-error';
import { MembershipRole } from '../../domain/enums/membership-role';
import { MembershipRepository } from '../../domain/repositories/membership.repository';

@Injectable()
export class RemoveMembershipUseCase {
  constructor(private readonly memberships: MembershipRepository) {}

  async execute(
    condominiumId: string,
    membershipId: string,
    actorUserId: string,
  ): Promise<void> {
    const memberships = await this.memberships.findManyByCondo(condominiumId);
    const membership = memberships.find((item) => item.id === membershipId);

    if (!membership) {
      throw new ResourceNotFoundError('Vínculo não encontrado neste condomínio.');
    }

    if (membership.userId === actorUserId) {
      throw new BusinessRuleError(
        'Você não pode remover a si mesmo. Peça a outro proprietário ou transfira o acesso antes.',
      );
    }

    if (membership.role === MembershipRole.Owner) {
      const owners = memberships.filter((item) => item.role === MembershipRole.Owner);

      if (owners.length <= 1) {
        throw new BusinessRuleError(
          'Não é possível remover o único proprietário do condomínio.',
        );
      }
    }

    await this.memberships.delete(membership.id);
  }
}
