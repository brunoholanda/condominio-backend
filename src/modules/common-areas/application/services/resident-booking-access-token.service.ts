import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import type { EnvironmentVariables } from '../../../../config/environment';
import { AuthenticationError } from '../../../../shared/domain/domain-error';

export interface ResidentBookingTokenPayload {
  sub: string;
  condominiumId: string;
  fullName: string;
  unitNumber: string;
  typ: 'resident_booking';
}

const TOKEN_TTL_SECONDS = 8 * 60 * 60;
const AUDIENCE = 'condogest-resident-booking';

@Injectable()
export class ResidentBookingAccessTokenService {
  private readonly secret: string;

  constructor(
    private readonly jwtService: JwtService,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.secret =
      config.get('JWT_BOOKING_SECRET', { infer: true })?.trim() ||
      `${config.get('JWT_SECRET', { infer: true })}:booking`;
  }

  async sign(payload: Omit<ResidentBookingTokenPayload, 'typ'>): Promise<{
    accessToken: string;
    expiresInSeconds: number;
  }> {
    const accessToken = await this.jwtService.signAsync(
      { ...payload, typ: 'resident_booking' satisfies ResidentBookingTokenPayload['typ'] },
      {
        expiresIn: TOKEN_TTL_SECONDS,
        secret: this.secret,
        audience: AUDIENCE,
      },
    );

    return { accessToken, expiresInSeconds: TOKEN_TTL_SECONDS };
  }

  async verify(token: string): Promise<ResidentBookingTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<ResidentBookingTokenPayload>(token, {
        secret: this.secret,
        audience: AUDIENCE,
      });

      if (
        payload.typ !== 'resident_booking' ||
        !payload.sub ||
        !payload.condominiumId ||
        !payload.unitNumber
      ) {
        throw new AuthenticationError('Sessão de reserva inválida.');
      }

      return {
        sub: payload.sub,
        condominiumId: payload.condominiumId,
        fullName: payload.fullName,
        unitNumber: payload.unitNumber,
        typ: 'resident_booking',
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      throw new AuthenticationError('Sessão expirada ou inválida. Informe o CPF novamente.');
    }
  }
}
