import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { AuthenticatedRequest } from '../../../auth/infrastructure/http/jwt-auth.guard';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { REQUIRE_SYSTEM_OWNER_KEY } from './require-system-owner.decorator';

/**
 * Ensures the caller is an active SYSTEM_OWNER. Checks the database so demotions
 * take effect without waiting for the JWT to expire.
 */
@Injectable()
export class SystemOwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly users: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<boolean>(REQUIRE_SYSTEM_OWNER_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user?.sub) {
      throw new ForbiddenException('Autenticação necessária.');
    }

    const user = await this.users.findById(request.user.sub);

    if (!user?.isActive || !user.isSystemOwner) {
      throw new ForbiddenException('Apenas o dono do sistema pode acessar esta área.');
    }

    return true;
  }
}
