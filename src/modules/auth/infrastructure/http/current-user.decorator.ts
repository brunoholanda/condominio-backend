import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';

import { AuthenticationError } from '../../../../shared/domain/domain-error';
import type { AccessTokenPayload } from '../../application/ports/access-token-service';
import type { AuthenticatedRequest } from './jwt-auth.guard';

/** Reads the identity attached to the request by `JwtAuthGuard`. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AccessTokenPayload => {
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!user) {
      throw new AuthenticationError('Autenticação necessária para acessar este recurso.');
    }

    return user;
  },
);
