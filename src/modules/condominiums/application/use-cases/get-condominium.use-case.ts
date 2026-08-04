import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import type { Condominium } from '../../domain/entities/condominium';
import type { MembershipRole } from '../../domain/enums/membership-role';
import { CondominiumRepository } from '../../domain/repositories/condominium.repository';
import type { CondominiumResponseDto } from '../dto/condominium-response.dto';
import { CondominiumPresenter } from '../presenters/condominium.presenter';

/**
 * Membership itself is checked by `CondominiumAccessGuard` before this runs;
 * this use case only fetches the aggregate for a member already cleared.
 */
@Injectable()
export class GetCondominiumUseCase {
  constructor(private readonly condominiums: CondominiumRepository) {}

  async execute(id: string, myRole?: MembershipRole): Promise<CondominiumResponseDto> {
    return CondominiumPresenter.toResponse(await this.getOrFail(id), myRole);
  }

  async getOrFail(id: string): Promise<Condominium> {
    const condominium = await this.condominiums.findById(id);

    if (!condominium) {
      throw new ResourceNotFoundError(`Condomínio ${id} não encontrado.`);
    }

    return condominium;
  }
}
