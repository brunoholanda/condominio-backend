import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { CreateBillingPortalSessionUseCase } from './application/use-cases/create-billing-portal-session.use-case';
import { CreateCheckoutSessionUseCase } from './application/use-cases/create-checkout-session.use-case';
import { HandleStripeWebhookUseCase } from './application/use-cases/handle-stripe-webhook.use-case';
import { StripeClient } from './infrastructure/stripe/stripe.client';
import { BillingController } from './presentation/billing.controller';

@Module({
  imports: [AuthModule],
  controllers: [BillingController],
  providers: [
    StripeClient,
    CreateCheckoutSessionUseCase,
    CreateBillingPortalSessionUseCase,
    HandleStripeWebhookUseCase,
  ],
})
export class BillingModule {}
