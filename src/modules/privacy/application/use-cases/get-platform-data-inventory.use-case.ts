import { ForbiddenException, Injectable } from '@nestjs/common';

import type { AccessTokenPayload } from '../../../auth/application/ports/access-token-service';
import { MembershipRole } from '../../../condominiums/domain/enums/membership-role';
import { MembershipRepository } from '../../../condominiums/domain/repositories/membership.repository';
import {
  buildPlatformDataInventory,
  type DataInventoryDocument,
} from '../data-inventory.content';

@Injectable()
export class GetPlatformDataInventoryUseCase {
  constructor(private readonly memberships: MembershipRepository) {}

  async execute(actor: AccessTokenPayload): Promise<DataInventoryDocument> {
    if (!actor.isSystemOwner) {
      const rows = await this.memberships.findManyByUser(actor.sub);
      const canManage = rows.some(
        (membership) =>
          membership.role === MembershipRole.Owner || membership.role === MembershipRole.Manager,
      );

      if (!canManage) {
        throw new ForbiddenException(
          'Apenas síndico, gestor ou administrador da plataforma podem consultar o inventário.',
        );
      }
    }

    return buildPlatformDataInventory();
  }
}
