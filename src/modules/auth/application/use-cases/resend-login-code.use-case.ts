import { Injectable } from '@nestjs/common';

import { ResourceExpiredError } from '../../../../shared/domain/domain-error';
import { LoginChallengeRepository } from '../../domain/repositories/login-challenge.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import type { LoginChallengeDto, ResendLoginCodeDto } from '../dto/login-challenge.dto';
import { LoginCodeIssuer } from '../services/login-code-issuer';

const EXPIRED = 'Sessão de login expirada. Faça login novamente.';

/**
 * Manda outro código para quem não recebeu o primeiro. Não pede a senha de novo
 * porque o desafio em andamento já prova que ela foi digitada corretamente há
 * pouco; o limite de reenvios está no próprio desafio.
 */
@Injectable()
export class ResendLoginCodeUseCase {
  constructor(
    private readonly challenges: LoginChallengeRepository,
    private readonly users: UserRepository,
    private readonly loginCodes: LoginCodeIssuer,
  ) {}

  async execute({ challengeId }: ResendLoginCodeDto): Promise<LoginChallengeDto> {
    const challenge = await this.challenges.findById(challengeId);

    if (!challenge || challenge.isConsumed) {
      throw new ResourceExpiredError(EXPIRED);
    }

    const user = await this.users.findById(challenge.userId);

    if (!user) {
      throw new ResourceExpiredError(EXPIRED);
    }

    return this.loginCodes.renew(challenge, user);
  }
}
