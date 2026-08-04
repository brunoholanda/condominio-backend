import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { AuthenticatedRequest } from '../../../auth/infrastructure/http/jwt-auth.guard';
import { Membership } from '../../domain/entities/membership';
import type { MembershipRole } from '../../domain/enums/membership-role';
import { MembershipRepository } from '../../domain/repositories/membership.repository';
import { MEMBERSHIP_ROLES_KEY } from './require-membership.decorator';

export interface RequestWithMembership extends AuthenticatedRequest {
  membership?: Membership;
}

/**
 * Confirms the authenticated user belongs to the condo of the route
 * (`:condominiumId` or `:id`) and, when `@RequireMembership(...)` is present,
 * that their role is one of the allowed ones. The membership is attached to
 * the request so handlers do not have to look it up again.
 *
 * System owners bypass membership checks with an OWNER-level synthetic access.
 */
@Injectable()
export class CondominiumAccessGuard implements CanActivate {
  constructor(
    private readonly memberships: MembershipRepository,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithMembership>();
    const rawCondominiumId = request.params.condominiumId ?? request.params.id;

    if (!rawCondominiumId || Array.isArray(rawCondominiumId)) {
      throw new ForbiddenException('Rota sem condomínio identificado.');
    }

    const condominiumId = rawCondominiumId;

    if (!request.user) {
      throw new ForbiddenException('Autenticação necessária para acessar este condomínio.');
    }

    if (request.user.isSystemOwner) {
      request.membership = Membership.forSystemOwner(request.user.sub, condominiumId);

      return true;
    }

    const membership = await this.memberships.findByUserAndCondo(request.user.sub, condominiumId);

    if (!membership) {
      throw new ForbiddenException('Você não tem acesso a este condomínio.');
    }

    const allowedRoles = this.reflector.getAllAndOverride<MembershipRole[] | undefined>(
      MEMBERSHIP_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (allowedRoles && allowedRoles.length > 0 && !membership.hasAnyRole(allowedRoles)) {
      throw new ForbiddenException('Seu papel neste condomínio não permite esta ação.');
    }

    request.membership = membership;

    return true;
  }
}
