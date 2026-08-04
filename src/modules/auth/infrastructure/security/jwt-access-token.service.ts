import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import type { EnvironmentVariables } from '../../../../config/environment';
import { AuthenticationError } from '../../../../shared/domain/domain-error';
import type {
  AccessTokenPayload,
  SignedAccessToken,
} from '../../application/ports/access-token-service';
import { AccessTokenService } from '../../application/ports/access-token-service';

const USER_AUDIENCE = 'condogest-user';

@Injectable()
export class JwtAccessTokenService extends AccessTokenService {
  private readonly expiresInSeconds: number;

  constructor(
    private readonly jwtService: JwtService,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    super();
    this.expiresInSeconds = config.get('JWT_EXPIRES_IN_SECONDS', { infer: true });
  }

  async sign(payload: Omit<AccessTokenPayload, 'typ'>): Promise<SignedAccessToken> {
    const token = await this.jwtService.signAsync(
      { ...payload, typ: 'user' satisfies AccessTokenPayload['typ'] },
      {
        expiresIn: this.expiresInSeconds,
        audience: USER_AUDIENCE,
      },
    );

    return { token, expiresInSeconds: this.expiresInSeconds };
  }

  async verify(token: string): Promise<AccessTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<Record<string, unknown>>(token, {
        audience: USER_AUDIENCE,
      });

      return this.toUserPayload(payload);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      // Tokens antigos (sem audience) — tenta verify sem audience e rejeita staff.
      try {
        const legacy = await this.jwtService.verifyAsync<Record<string, unknown>>(token);

        return this.toUserPayload(legacy);
      } catch (legacyError) {
        if (legacyError instanceof AuthenticationError) {
          throw legacyError;
        }

        throw new AuthenticationError('Sessão expirada ou inválida. Faça login novamente.');
      }
    }
  }

  private toUserPayload(payload: Record<string, unknown>): AccessTokenPayload {
    if (payload.typ === 'staff') {
      throw new AuthenticationError('Token de funcionário não é válido nesta área.');
    }

    if (payload.typ != null && payload.typ !== 'user') {
      throw new AuthenticationError('Sessão inválida. Faça login novamente.');
    }

    return {
      sub: String(payload.sub ?? ''),
      email: String(payload.email ?? ''),
      name: String(payload.name ?? ''),
      isSystemOwner: Boolean(payload.isSystemOwner),
      typ: 'user',
    };
  }
}
