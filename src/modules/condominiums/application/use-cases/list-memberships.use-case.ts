import { Injectable } from '@nestjs/common';

import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { MembershipRepository } from '../../domain/repositories/membership.repository';
import type { MembershipMemberDto } from '../dto/membership-member.dto';
import { MembershipPresenter } from '../presenters/membership.presenter';

@Injectable()
export class ListMembershipsUseCase {
  constructor(
    private readonly memberships: MembershipRepository,
    private readonly users: UserRepository,
  ) {}

  async execute(condominiumId: string): Promise<MembershipMemberDto[]> {
    const memberships = await this.memberships.findManyByCondo(condominiumId);

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const user = await this.users.findById(membership.userId);

        if (!user) {
          return null;
        }

        return MembershipPresenter.toResponse(membership, user);
      }),
    );

    return members
      .filter((member): member is MembershipMemberDto => member !== null)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }
}
