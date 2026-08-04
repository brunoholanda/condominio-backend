import { Injectable } from '@nestjs/common';

import {
  BusinessRuleError,
  ResourceNotFoundError,
} from '../../../../shared/domain/domain-error';
import type { AccessTokenPayload } from '../../../auth/application/ports/access-token-service';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { StripeClient } from '../../infrastructure/stripe/stripe.client';

@Injectable()
export class CreateBillingPortalSessionUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly stripe: StripeClient,
  ) {}

  async execute(actor: AccessTokenPayload): Promise<{ url: string }> {
    const user = await this.users.findById(actor.sub);

    if (!user) {
      throw new ResourceNotFoundError('Conta não encontrada.');
    }

    if (!user.stripeCustomerId) {
      throw new BusinessRuleError(
        'Nenhuma assinatura Stripe encontrada. Inicie o checkout do plano desejado.',
      );
    }

    const session = await this.stripe.require().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${this.stripe.publicAppUrl()}/app/conta`,
    });

    return { url: session.url };
  }
}
