import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { EnvironmentVariables } from '../../../../config/environment';
import {
  BusinessRuleError,
  ResourceNotFoundError,
} from '../../../../shared/domain/domain-error';
import type { AccessTokenPayload } from '../../../auth/application/ports/access-token-service';
import { SubscriptionPlan } from '../../../auth/domain/enums/subscription-plan';
import { SubscriptionStatus } from '../../../auth/domain/enums/subscription-status';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { StripeClient } from '../../infrastructure/stripe/stripe.client';

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly stripe: StripeClient,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async execute(
    actor: AccessTokenPayload,
    plan: SubscriptionPlan,
  ): Promise<{ url: string }> {
    const user = await this.users.findById(actor.sub);

    if (!user) {
      throw new ResourceNotFoundError('Conta não encontrada.');
    }

    const client = this.stripe.require();
    const priceId = this.stripe.priceIdForPlan(plan);
    const appUrl = this.stripe.publicAppUrl();
    const customerId = await this.ensureCustomer(user.id, user.email.value, user.name, user.stripeCustomerId);

    const trialDays = this.config.get('BILLING_TRIAL_DAYS', { infer: true });
    const stillInLocalTrial =
      user.subscriptionStatus === SubscriptionStatus.Trialing &&
      user.trialEndsAt.getTime() > Date.now() &&
      !user.stripeSubscriptionId;

    const remainingTrialDays = stillInLocalTrial
      ? Math.max(
          1,
          Math.ceil((user.trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
        )
      : 0;

    const session = await client.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/app/conta?checkout=success`,
      cancel_url: `${appUrl}/app/conta?checkout=cancel`,
      metadata: {
        userId: user.id,
        plan,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan,
        },
        ...(remainingTrialDays > 0
          ? { trial_period_days: Math.min(remainingTrialDays, trialDays) }
          : {}),
      },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      throw new BusinessRuleError('Não foi possível iniciar o checkout Stripe.');
    }

    if (!user.stripeCustomerId) {
      await this.users.save(
        user.withSubscription({
          stripeCustomerId: customerId,
        }),
      );
    }

    return { url: session.url };
  }

  private async ensureCustomer(
    userId: string,
    email: string,
    name: string,
    existingCustomerId: string | null,
  ): Promise<string> {
    const client = this.stripe.require();

    if (existingCustomerId) {
      return existingCustomerId;
    }

    const customer = await client.customers.create({
      email,
      name,
      metadata: { userId },
    });

    return customer.id;
  }
}
