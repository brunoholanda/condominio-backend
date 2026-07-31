import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { AuthenticationError } from '../../../../shared/domain/domain-error';
import type { AccessTokenPayload } from '../../application/ports/access-token-service';
import { AccessTokenService } from '../../application/ports/access-token-service';
import { IS_PUBLIC_KEY } from './public.decorator';

export interface AuthenticatedRequest extends Request {
  user?: AccessTokenPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly accessTokens: AccessTokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = JwtAuthGuard.extractBearerToken(request);

    if (!token) {
      throw new AuthenticationError('Autenticação necessária para acessar este recurso.');
    }

    request.user = await this.accessTokens.verify(token);

    return true;
  }

  private static extractBearerToken(request: Request): string | null {
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');

    return scheme?.toLowerCase() === 'bearer' && token ? token : null;
  }
}
