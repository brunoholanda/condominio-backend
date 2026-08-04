import { Injectable } from '@nestjs/common';

import {
  BusinessRuleError,
  ResourceNotFoundError,
} from '../../../../shared/domain/domain-error';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { MembershipRole } from '../../domain/enums/membership-role';
import { MembershipRepository } from '../../domain/repositories/membership.repository';
import type { MembershipMemberDto } from '../dto/membership-member.dto';
import type { UpdateMembershipRoleDto } from '../dto/update-membership-role.dto';
import { MembershipPresenter } from '../presenters/membership.presenter';

@Injectable()
export class UpdateMembershipRoleUseCase {
  constructor(
    private readonly memberships: MembershipRepository,
    private readonly users: UserRepository,
  ) {}

  async execute(
    condominiumId: string,
    membershipId: string,
    input: UpdateMembershipRoleDto,
  ): Promise<MembershipMemberDto> {
    const membership = await this.findInCondo(membershipId, condominiumId);

    if (membership.role === MembershipRole.Owner && input.role !== MembershipRole.Owner) {
      await this.assertNotLastOwner(condominiumId);
    }

    const updated = await this.memberships.save(membership.withRole(input.role));
    const user = await this.users.findById(updated.userId);

    if (!user) {
      throw new ResourceNotFoundError('Usuário do vínculo não encontrado.');
    }

    return MembershipPresenter.toResponse(updated, user);
  }

  private async findInCondo(membershipId: string, condominiumId: string) {
    const memberships = await this.memberships.findManyByCondo(condominiumId);
    const membership = memberships.find((item) => item.id === membershipId);

    if (!membership) {
      throw new ResourceNotFoundError('Vínculo não encontrado neste condomínio.');
    }

    return membership;
  }

  private async assertNotLastOwner(condominiumId: string): Promise<void> {
    const owners = (await this.memberships.findManyByCondo(condominiumId)).filter(
      (item) => item.role === MembershipRole.Owner,
    );

    if (owners.length <= 1) {
      throw new BusinessRuleError(
        'Não é possível alterar o papel do único proprietário do condomínio.',
      );
    }
  }
}
