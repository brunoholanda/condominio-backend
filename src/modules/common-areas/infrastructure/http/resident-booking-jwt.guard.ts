import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Injectable, createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

import { AuthenticationError } from '../../../../shared/domain/domain-error';
import {
  ResidentBookingAccessTokenService,
  type ResidentBookingTokenPayload,
} from '../../application/services/resident-booking-access-token.service';

export interface ResidentBookingAuthenticatedRequest extends Request {
  bookingResident?: ResidentBookingTokenPayload;
}

@Injectable()
export class ResidentBookingJwtGuard implements CanActivate {
  constructor(private readonly tokens: ResidentBookingAccessTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ResidentBookingAuthenticatedRequest>();
    const token = ResidentBookingJwtGuard.extractBearerToken(request);

    if (!token) {
      throw new AuthenticationError('Autenticação de reserva necessária.');
    }

    request.bookingResident = await this.tokens.verify(token);

    return true;
  }

  private static extractBearerToken(request: Request): string | null {
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');

    return scheme?.toLowerCase() === 'bearer' && token ? token : null;
  }
}

export const CurrentBookingResident = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ResidentBookingTokenPayload => {
    const request = context.switchToHttp().getRequest<ResidentBookingAuthenticatedRequest>();

    if (!request.bookingResident) {
      throw new AuthenticationError('Autenticação de reserva necessária.');
    }

    return request.bookingResident;
  },
);
