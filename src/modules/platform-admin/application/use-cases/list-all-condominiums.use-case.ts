import { Injectable } from '@nestjs/common';

import { MembershipRole } from '../../../condominiums/domain/enums/membership-role';
import { CondominiumRepository } from '../../../condominiums/domain/repositories/condominium.repository';
import type { CondominiumResponseDto } from '../../../condominiums/application/dto/condominium-response.dto';
import { CondominiumPresenter } from '../../../condominiums/application/presenters/condominium.presenter';

/** Lists every condominium on the platform for the system owner. */
@Injectable()
export class ListAllCondominiumsUseCase {
  constructor(private readonly condominiums: CondominiumRepository) {}

  async execute(): Promise<CondominiumResponseDto[]> {
    const all = await this.condominiums.findAll();

    return all.map((condominium) =>
      CondominiumPresenter.toResponse(condominium, MembershipRole.Owner),
    );
  }
}
