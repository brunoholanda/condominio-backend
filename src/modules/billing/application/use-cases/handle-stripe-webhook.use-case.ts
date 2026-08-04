import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type Stripe from 'stripe';

import type { EnvironmentVariables } from '../../../../config/environment';
import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { SubscriptionPlan } from '../../../auth/domain/enums/subscription-plan';
import { SubscriptionStatus } from '../../../auth/domain/enums/subscription-status';
import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import { StripeClient } from '../../infrastructure/stripe/stripe.client';

@Injectable()
export class HandleStripeWebhookUseCase {
  private readonly logger = new Logger(HandleStripeWebhookUseCase.name);

  constructor(
    private readonly users: UserRepository,
    private readonly stripe: StripeClient,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async execute(rawBody: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET', { infer: true })?.trim();

    if (!webhookSecret) {
      throw new BusinessRuleError('STRIPE_WEBHOOK_SECRET não configurado.');
    }

    const client = this.stripe.require();
    let event: Stripe.Event;

    try {
      event = client.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error: unknown) {
      this.logger.warn(
        `Assinatura de webhook Stripe inválida: ${error instanceof Error ? error.message : error}`,
      );
      throw new BusinessRuleError('Assinatura do webhook Stripe inválida.');
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.onSubscriptionChanged(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.onSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await this.onInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        this.logger.debug(`Evento Stripe ignorado: ${event.type}`);
    }
  }

  private async onCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId ?? session.client_reference_id;
    const customerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id;
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    if (!userId || !customerId) {
      return;
    }

    const user = await this.users.findById(userId);

    if (!user) {
      this.logger.warn(`Checkout sem usuário local: ${userId}`);
      return;
    }

    const planFromMeta = this.parsePlan(session.metadata?.plan);
    let plan = planFromMeta ?? user.plan;

    if (subscriptionId) {
      const subscription = await this.stripe.require().subscriptions.retrieve(subscriptionId);
      plan = this.planFromSubscription(subscription) ?? plan;
      await this.applySubscription(user.id, customerId, subscription, plan);
      return;
    }

    await this.users.save(
      user.withSubscription({
        plan,
        status: SubscriptionStatus.Active,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId ?? user.stripeSubscriptionId,
      }),
    );
  }

  private async onSubscriptionChanged(subscription: Stripe.Subscription): Promise<void> {
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;
    const user =
      (subscription.metadata?.userId
        ? await this.users.findById(subscription.metadata.userId)
        : null) ?? (await this.users.findByStripeCustomerId(customerId));

    if (!user) {
      this.logger.warn(`Assinatura Stripe sem usuário: ${subscription.id}`);
      return;
    }

    const plan =
      this.planFromSubscription(subscription) ??
      this.parsePlan(subscription.metadata?.plan) ??
      user.plan;

    await this.applySubscription(user.id, customerId, subscription, plan);
  }

  private async onSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;
    const user =
      (subscription.metadata?.userId
        ? await this.users.findById(subscription.metadata.userId)
        : null) ?? (await this.users.findByStripeCustomerId(customerId));

    if (!user) {
      return;
    }

    await this.users.save(
      user.withSubscription({
        status: SubscriptionStatus.Canceled,
        stripeCustomerId: customerId,
        stripeSubscriptionId: null,
      }),
    );
  }

  private async onInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId =
      typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

    if (!customerId) {
      return;
    }

    const user = await this.users.findByStripeCustomerId(customerId);

    if (!user) {
      return;
    }

    await this.users.save(
      user.withSubscription({
        status: SubscriptionStatus.PastDue,
        stripeCustomerId: customerId,
      }),
    );
  }

  private async applySubscription(
    userId: string,
    customerId: string,
    subscription: Stripe.Subscription,
    plan: SubscriptionPlan,
  ): Promise<void> {
    const user = await this.users.findById(userId);

    if (!user) {
      return;
    }

    const status = this.mapStripeStatus(subscription.status);
    const trialEndsAt = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : user.trialEndsAt;

    await this.users.save(
      user.withSubscription({
        plan,
        status,
        trialEndsAt,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
      }),
    );
  }

  private planFromSubscription(subscription: Stripe.Subscription): SubscriptionPlan | null {
    const priceId = subscription.items.data[0]?.price?.id;

    return priceId ? this.stripe.planFromPriceId(priceId) : null;
  }

  private parsePlan(raw: string | undefined): SubscriptionPlan | null {
    if (!raw) {
      return null;
    }

    if (raw === SubscriptionPlan.Lite || raw === SubscriptionPlan.Prime || raw === SubscriptionPlan.Gestor) {
      return raw;
    }

    return null;
  }

  private mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
    switch (status) {
      case 'trialing':
        return SubscriptionStatus.Trialing;
      case 'active':
        return SubscriptionStatus.Active;
      case 'past_due':
      case 'unpaid':
        return SubscriptionStatus.PastDue;
      case 'canceled':
      case 'incomplete_expired':
        return SubscriptionStatus.Canceled;
      default:
        return SubscriptionStatus.PastDue;
    }
  }
}
