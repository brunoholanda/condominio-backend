import { Injectable } from '@nestjs/common';

import { AuthenticationError } from '../../../../shared/domain/domain-error';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordHasher } from '../../domain/services/password-hasher';
import type { LoginChallengeDto } from '../dto/login-challenge.dto';
import type { LoginDto } from '../dto/login.dto';
import { LoginCodeIssuer } from '../services/login-code-issuer';

/**
 * Hash of an impossible password, compared when the e-mail does not exist so that
 * both branches cost the same and the response time does not reveal valid accounts.
 */
const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.dO0Q0mSPzn0Uc2CtQGkc3EEcQvhq';

/**
 * Primeira etapa: confere e-mail e senha e manda o código para a caixa da conta.
 * Nenhum token é emitido aqui — a senha sozinha não abre a área restrita.
 */
@Injectable()
export class StartLoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly loginCodes: LoginCodeIssuer,
  ) {}

  async execute({ email, password }: LoginDto): Promise<LoginChallengeDto> {
    const user = await this.users.findByEmail(email.trim().toLowerCase());
    const matches = await this.passwordHasher.compare(password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !matches) {
      throw new AuthenticationError('E-mail ou senha inválidos.');
    }

    return this.loginCodes.issueFor(user);
  }
}
