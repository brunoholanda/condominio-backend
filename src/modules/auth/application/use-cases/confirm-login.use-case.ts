import { Injectable } from '@nestjs/common';

import { AuthenticationError, ResourceExpiredError } from '../../../../shared/domain/domain-error';
import { LoginChallengeRepository } from '../../domain/repositories/login-challenge.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordHasher } from '../../domain/services/password-hasher';
import type { ConfirmLoginDto } from '../dto/confirm-login.dto';
import type { LoginResponseDto } from '../dto/auth-response.dto';
import { AccessTokenService } from '../ports/access-token-service';
import { UserPresenter } from '../presenters/user.presenter';

const EXPIRED = 'Sessão de login expirada. Faça login novamente.';

/** Segunda etapa: o código correto, dentro do prazo, é o que emite o token. */
@Injectable()
export class ConfirmLoginUseCase {
  constructor(
    private readonly challenges: LoginChallengeRepository,
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly accessTokens: AccessTokenService,
  ) {}

  async execute({ challengeId, code }: ConfirmLoginDto): Promise<LoginResponseDto> {
    const challenge = await this.challenges.findById(challengeId);

    if (!challenge) {
      throw new ResourceExpiredError(EXPIRED);
    }

    challenge.ensureUsable();

    const user = await this.users.findById(challenge.userId);

    if (!user) {
      throw new ResourceExpiredError(EXPIRED);
    }

    if (!(await this.passwordHasher.compare(code, challenge.codeHash))) {
      const failed = challenge.registerFailure();

      await this.challenges.save(failed);

      if (failed.remainingAttempts === 0) {
        throw new ResourceExpiredError(
          'Número de tentativas excedido. Faça login novamente para receber outro código.',
        );
      }

      throw new AuthenticationError(
        `Código incorreto. Você ainda tem ${failed.remainingAttempts} tentativa(s).`,
      );
    }

    await this.challenges.save(challenge.consume());

    const { token, expiresInSeconds } = await this.accessTokens.sign({
      sub: user.id,
      email: user.email.value,
      name: user.name,
    });

    return {
      accessToken: token,
      expiresIn: expiresInSeconds,
      user: UserPresenter.toResponse(user),
    };
  }
}
