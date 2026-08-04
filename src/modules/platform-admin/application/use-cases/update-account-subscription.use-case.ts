import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { EnvironmentVariables } from '../../../../config/environment';
import {
  BusinessRuleError,
  ResourceNotFoundError,
} from '../../../../shared/domain/domain-error';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { SubscriptionStatus } from '../../../auth/domain/enums/subscription-status';
import type { PlatformAccountDto } from '../dto/platform-account.dto';
import type { UpdateAccountSubscriptionDto } from '../dto/update-account-subscription.dto';
import { PlatformAccountPresenter } from '../presenters/platform-account.presenter';

@Injectable()
export class UpdateAccountSubscriptionUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async execute(
    accountId: string,
    input: UpdateAccountSubscriptionDto,
  ): Promise<PlatformAccountDto> {
    if (input.plan === undefined && input.status === undefined) {
      throw new BusinessRuleError('Informe o plano e/ou o status da assinatura.');
    }

    const user = await this.users.findById(accountId);

    if (!user) {
      throw new ResourceNotFoundError('Conta não encontrada.');
    }

    const trialDays = this.config.get('BILLING_TRIAL_DAYS', { infer: true });
    const now = new Date();
    const updated = await this.users.save(
      user.withSubscription({
        plan: input.plan,
        status: input.status,
        trialEndsAt:
          input.status === SubscriptionStatus.Trialing
            ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000)
            : undefined,
      }),
    );

    return PlatformAccountPresenter.toResponse(updated);
  }
}
