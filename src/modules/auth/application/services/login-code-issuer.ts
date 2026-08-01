import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { EnvironmentVariables } from '../../../../config/environment';
import { MailSender } from '../../../../shared/application/ports/mail-sender';
import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import type { User } from '../../domain/entities/user';
import { LoginChallenge } from '../../domain/entities/login-challenge';
import { LoginChallengeRepository } from '../../domain/repositories/login-challenge.repository';
import { PasswordHasher } from '../../domain/services/password-hasher';
import { LoginCode } from '../../domain/value-objects/login-code';
import type { LoginChallengeDto } from '../dto/login-challenge.dto';
import { buildLoginCodeMail } from '../mail/login-code.mail';

const SECONDS_PER_MINUTE = 60;

/**
 * Sorteia o código, guarda apenas o hash e o entrega por e-mail. Fica em um
 * serviço próprio porque tanto o primeiro envio quanto o reenvio precisam
 * exatamente do mesmo passo a passo.
 */
@Injectable()
export class LoginCodeIssuer {
  private readonly logger = new Logger(LoginCodeIssuer.name);

  constructor(
    private readonly challenges: LoginChallengeRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly mail: MailSender,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  /** Um login novo invalida qualquer código anterior daquela conta. */
  async issueFor(user: User): Promise<LoginChallengeDto> {
    await this.challenges.discardFor(user.id);

    const ttlSeconds = this.ttlSeconds;
    const code = LoginCode.random();
    const challenge = LoginChallenge.issue({
      userId: user.id,
      codeHash: await this.passwordHasher.hash(code.value),
      ttlSeconds,
    });

    await this.challenges.save(challenge);
    await this.deliver(user, code, ttlSeconds);

    return this.describe(challenge, user);
  }

  async renew(challenge: LoginChallenge, user: User): Promise<LoginChallengeDto> {
    const ttlSeconds = this.ttlSeconds;
    const code = LoginCode.random();
    const renewed = challenge.renew(await this.passwordHasher.hash(code.value), ttlSeconds);

    await this.challenges.save(renewed);
    await this.deliver(user, code, ttlSeconds);

    return this.describe(renewed, user);
  }

  /**
   * Uma falha do servidor de e-mail é problema nosso, não do operador: o motivo
   * fica no log e a pessoa recebe um recado que ela consegue entender.
   */
  private async deliver(user: User, code: LoginCode, ttlSeconds: number): Promise<void> {
    try {
      await this.mail.send(
        buildLoginCodeMail({
          to: user.email.value,
          name: user.name,
          code: code.value,
          expiresInMinutes: Math.round(ttlSeconds / SECONDS_PER_MINUTE),
        }),
      );
    } catch (error: unknown) {
      this.logger.error(
        `Falha ao enviar o código de acesso da conta ${user.id}.`,
        error instanceof Error ? error.stack : String(error),
      );

      throw new BusinessRuleError(
        'Não foi possível enviar o código de acesso agora. Tente novamente em alguns instantes.',
      );
    }
  }

  private describe(challenge: LoginChallenge, user: User): LoginChallengeDto {
    return {
      challengeId: challenge.id,
      email: user.email.masked,
      expiresInSeconds: challenge.expiresInSeconds,
    };
  }

  private get ttlSeconds(): number {
    return this.config.get('LOGIN_CODE_TTL_SECONDS', { infer: true });
  }
}
