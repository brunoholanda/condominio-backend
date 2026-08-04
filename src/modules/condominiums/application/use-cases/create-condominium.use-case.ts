import { Injectable } from '@nestjs/common';

import {
  BusinessRuleError,
  ResourceConflictError,
  ResourceNotFoundError,
} from '../../../../shared/domain/domain-error';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import {
  isLimitedCondoPlan,
  LITE_MAX_UNITS,
  SubscriptionPlan,
} from '../../../auth/domain/enums/subscription-plan';
import { Condominium } from '../../domain/entities/condominium';
import { Membership } from '../../domain/entities/membership';
import { MembershipRole } from '../../domain/enums/membership-role';
import { CondominiumRepository } from '../../domain/repositories/condominium.repository';
import { MembershipRepository } from '../../domain/repositories/membership.repository';
import type { CreateCondominiumDto } from '../dto/create-condominium.dto';
import type { CondominiumResponseDto } from '../dto/condominium-response.dto';
import { CondominiumPresenter } from '../presenters/condominium.presenter';

/** Whoever creates a condo becomes its OWNER, with full control over it. */
@Injectable()
export class CreateCondominiumUseCase {
  constructor(
    private readonly condominiums: CondominiumRepository,
    private readonly memberships: MembershipRepository,
    private readonly users: UserRepository,
  ) {}

  async execute(userId: string, input: CreateCondominiumDto): Promise<CondominiumResponseDto> {
    const actor = await this.users.findById(userId);

    if (!actor) {
      throw new ResourceNotFoundError('Conta não encontrada.');
    }

    if (!actor.isSystemOwner && isLimitedCondoPlan(actor.plan)) {
      const owned = (await this.memberships.findManyByUser(userId)).filter(
        (membership) => membership.role === MembershipRole.Owner,
      );

      if (owned.length >= 1) {
        throw new BusinessRuleError(
          'Seu plano permite apenas 1 condomínio. Faça upgrade para o plano Gestor para gerenciar vários prédios.',
          'PLAN_CONDO_LIMIT',
        );
      }
    }

    if (
      !actor.isSystemOwner &&
      actor.plan === SubscriptionPlan.Lite &&
      input.unitNumbers.length > LITE_MAX_UNITS
    ) {
      throw new BusinessRuleError(
        `O plano Lite inclui até ${LITE_MAX_UNITS} unidades. Faça upgrade para o plano Prime para unidades ilimitadas.`,
        'PLAN_UNIT_LIMIT',
      );
    }

    const existing = await this.condominiums.findBySlug(input.slug);

    if (existing) {
      throw new ResourceConflictError(`O identificador "${input.slug}" já está em uso.`);
    }

    const condominium = await this.condominiums.save(Condominium.create(input));

    await this.memberships.save(
      Membership.create({ userId, condominiumId: condominium.id, role: MembershipRole.Owner }),
    );

    return CondominiumPresenter.toResponse(condominium, MembershipRole.Owner);
  }
}
