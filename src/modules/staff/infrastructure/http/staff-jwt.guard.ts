import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable, createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

import { AuthenticationError } from '../../../../shared/domain/domain-error';
import {
  StaffAccessTokenService,
  type StaffTokenPayload,
} from '../../application/use-cases/staff-auth.use-case';

export interface StaffAuthenticatedRequest extends Request {
  staff?: StaffTokenPayload;
}

@Injectable()
export class StaffJwtAuthGuard implements CanActivate {
  constructor(private readonly tokens: StaffAccessTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<StaffAuthenticatedRequest>();
    const token = StaffJwtAuthGuard.extractBearerToken(request);

    if (!token) {
      throw new AuthenticationError('Autenticação de funcionário necessária.');
    }

    request.staff = await this.tokens.verify(token);

    return true;
  }

  private static extractBearerToken(request: Request): string | null {
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');

    return scheme?.toLowerCase() === 'bearer' && token ? token : null;
  }
}

export const CurrentStaff = createParamDecorator(
  (_data: unknown, context: ExecutionContext): StaffTokenPayload => {
    const request = context.switchToHttp().getRequest<StaffAuthenticatedRequest>();

    if (!request.staff) {
      throw new AuthenticationError('Autenticação de funcionário necessária.');
    }

    return request.staff;
  },
);
