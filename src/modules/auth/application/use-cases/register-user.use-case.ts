import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { EnvironmentVariables } from '../../../../config/environment';
import { ResourceConflictError } from '../../../../shared/domain/domain-error';
import { User } from '../../domain/entities/user';
import { SubscriptionPlan } from '../../domain/enums/subscription-plan';
import { SubscriptionStatus } from '../../domain/enums/subscription-status';
import { assertPasswordPolicy } from '../../domain/password-policy';
import { UserRepository } from '../../domain/repositories/user.repository';
import { PasswordHasher } from '../../domain/services/password-hasher';
import type { AuthenticatedUserDto } from '../dto/auth-response.dto';
import type { RegisterDto } from '../dto/register.dto';
import { UserPresenter } from '../presenters/user.presenter';

/**
 * Public sign-up. No token is issued here on purpose: the account still has to
 * go through the OTP login, same as everyone else.
 */
@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async execute(input: RegisterDto): Promise<AuthenticatedUserDto> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.users.findByEmail(email);

    if (existing) {
      throw new ResourceConflictError('Já existe uma conta cadastrada com este e-mail.');
    }

    const trialDays = this.config.get('BILLING_TRIAL_DAYS', { infer: true });
    const now = new Date();
    const passwordHash = await this.passwordHasher.hash(assertPasswordPolicy(input.password));
    const user = await this.users.save(
      User.create({
        name: input.name,
        email,
        passwordHash,
        plan: input.plan ?? SubscriptionPlan.Lite,
        subscriptionStatus: SubscriptionStatus.Trialing,
        trialEndsAt: new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000),
        subscriptionUpdatedAt: now,
      }),
    );

    return UserPresenter.toResponse(user);
  }
}
