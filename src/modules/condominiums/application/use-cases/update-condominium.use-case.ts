import { Injectable } from '@nestjs/common';

import {
  BusinessRuleError,
  ResourceConflictError,
  ResourceNotFoundError,
} from '../../../../shared/domain/domain-error';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import {
  LITE_MAX_UNITS,
  SubscriptionPlan,
} from '../../../auth/domain/enums/subscription-plan';
import { MembershipRole } from '../../domain/enums/membership-role';
import { CondominiumRepository } from '../../domain/repositories/condominium.repository';
import { MembershipRepository } from '../../domain/repositories/membership.repository';
import type { CondominiumResponseDto } from '../dto/condominium-response.dto';
import type { UpdateCondominiumDto } from '../dto/update-condominium.dto';
import { CondominiumPresenter } from '../presenters/condominium.presenter';
import { GetCondominiumUseCase } from './get-condominium.use-case';

@Injectable()
export class UpdateCondominiumUseCase {
  constructor(
    private readonly condominiums: CondominiumRepository,
    private readonly memberships: MembershipRepository,
    private readonly users: UserRepository,
    private readonly getCondominium: GetCondominiumUseCase,
  ) {}

  async execute(id: string, input: UpdateCondominiumDto): Promise<CondominiumResponseDto> {
    const current = await this.getCondominium.getOrFail(id);

    if (input.slug && input.slug.toLowerCase() !== current.slug.value) {
      const owner = await this.condominiums.findBySlug(input.slug);

      if (owner && owner.id !== id) {
        throw new ResourceConflictError(`O identificador "${input.slug}" já está em uso.`);
      }
    }

    const nextUnits = input.unitNumbers ?? current.unitNumbers;

    if (
      input.unitNumbers !== undefined &&
      nextUnits.length > current.unitNumbers.length &&
      nextUnits.length > LITE_MAX_UNITS
    ) {
      const ownerMembership = (await this.memberships.findManyByCondo(id)).find(
        (membership) => membership.role === MembershipRole.Owner,
      );

      if (!ownerMembership) {
        throw new ResourceNotFoundError('Proprietário do condomínio não encontrado.');
      }

      const owner = await this.users.findById(ownerMembership.userId);

      if (!owner) {
        throw new ResourceNotFoundError('Proprietário do condomínio não encontrado.');
      }

      if (!owner.isSystemOwner && owner.plan === SubscriptionPlan.Lite) {
        throw new BusinessRuleError(
          `O plano Lite inclui até ${LITE_MAX_UNITS} unidades. Faça upgrade para o plano Prime para unidades ilimitadas.`,
          'PLAN_UNIT_LIMIT',
        );
      }
    }

    const snapshot = current.toSnapshot();

    const updated = current.withData({
      name: input.name ?? current.name,
      slug: input.slug ?? current.slug.value,
      unitNumbers: nextUnits,
      buildingHandoverDate:
        input.buildingHandoverDate !== undefined
          ? input.buildingHandoverDate
          : snapshot.buildingHandoverDate,
      publicHubLinks:
        input.publicHubLinks !== undefined ? input.publicHubLinks : current.publicHubLinks,
      address: input.address !== undefined ? input.address : snapshot.address,
      latitude: input.latitude !== undefined ? input.latitude : snapshot.latitude,
      longitude: input.longitude !== undefined ? input.longitude : snapshot.longitude,
      geofenceRadiusMeters:
        input.geofenceRadiusMeters !== undefined
          ? input.geofenceRadiusMeters
          : snapshot.geofenceRadiusMeters,
    });

    return CondominiumPresenter.toResponse(await this.condominiums.update(updated));
  }
}
