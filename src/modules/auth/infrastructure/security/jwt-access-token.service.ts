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

  async sign(payload: AccessTokenPayload): Promise<SignedAccessToken> {
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: this.expiresInSeconds,
    });

    return { token, expiresInSeconds: this.expiresInSeconds };
  }

  async verify(token: string): Promise<AccessTokenPayload> {
    try {
      return await this.jwtService.verifyAsync<AccessTokenPayload>(token);
    } catch {
      throw new AuthenticationError('Sessão expirada ou inválida. Faça login novamente.');
    }
  }
}
