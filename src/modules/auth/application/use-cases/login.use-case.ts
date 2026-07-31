import { Injectable } from '@nestjs/common';

import { AuthenticationError } from '../../../../shared/domain/domain-error';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordHasher } from '../../domain/services/password-hasher';
import type { LoginDto } from '../dto/login.dto';
import type { LoginResponseDto } from '../dto/auth-response.dto';
import { AccessTokenService } from '../ports/access-token-service';
import { UserPresenter } from '../presenters/user.presenter';

/**
 * Hash of an impossible password, compared when the e-mail does not exist so that
 * both branches cost the same and the response time does not reveal valid accounts.
 */
const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8.dO0Q0mSPzn0Uc2CtQGkc3EEcQvhq';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly accessTokens: AccessTokenService,
  ) {}

  async execute({ email, password }: LoginDto): Promise<LoginResponseDto> {
    const user = await this.users.findByEmail(email.trim().toLowerCase());
    const matches = await this.passwordHasher.compare(password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !matches) {
      throw new AuthenticationError('E-mail ou senha inválidos.');
    }

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
