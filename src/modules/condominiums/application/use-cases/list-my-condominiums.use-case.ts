import { Injectable } from '@nestjs/common';

import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { MembershipRole } from '../../domain/enums/membership-role';
import { CondominiumRepository } from '../../domain/repositories/condominium.repository';
import { MembershipRepository } from '../../domain/repositories/membership.repository';
import type { CondominiumResponseDto } from '../dto/condominium-response.dto';
import { CondominiumPresenter } from '../presenters/condominium.presenter';

@Injectable()
export class ListMyCondominiumsUseCase {
  constructor(
    private readonly condominiums: CondominiumRepository,
    private readonly memberships: MembershipRepository,
    private readonly users: UserRepository,
  ) {}

  async execute(userId: string): Promise<CondominiumResponseDto[]> {
    const user = await this.users.findById(userId);

    if (user?.isSystemOwner) {
      const all = await this.condominiums.findAll();

      return all.map((condominium) =>
        CondominiumPresenter.toResponse(condominium, MembershipRole.Owner),
      );
    }

    const [condominiums, memberships] = await Promise.all([
      this.condominiums.findManyByUserId(userId),
      this.memberships.findManyByUser(userId),
    ]);
    const roleByCondo = new Map(memberships.map((m) => [m.condominiumId, m.role]));

    return condominiums.map((condominium) =>
      CondominiumPresenter.toResponse(condominium, roleByCondo.get(condominium.id)),
    );
  }
}
