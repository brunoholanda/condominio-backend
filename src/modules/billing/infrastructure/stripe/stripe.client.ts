import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import type { EnvironmentVariables } from '../../../../config/environment';
import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { SubscriptionPlan } from '../../../auth/domain/enums/subscription-plan';

@Injectable()
export class StripeClient {
  private readonly client: Stripe | null;

  constructor(private readonly config: ConfigService<EnvironmentVariables, true>) {
    const secret = this.config.get('STRIPE_SECRET_KEY', { infer: true })?.trim();
    this.client = secret ? new Stripe(secret) : null;
  }

  require(): Stripe {
    if (!this.client) {
      throw new BusinessRuleError(
        'Pagamentos Stripe não estão configurados. Defina STRIPE_SECRET_KEY.',
      );
    }

    return this.client;
  }

  isConfigured(): boolean {
    return Boolean(this.client);
  }

  priceIdForPlan(plan: SubscriptionPlan): string {
    const map: Record<SubscriptionPlan, string | undefined> = {
      [SubscriptionPlan.Lite]: this.config.get('STRIPE_PRICE_ID', { infer: true })?.trim(),
      [SubscriptionPlan.Prime]: this.config.get('STRIPE_PRIME_PRICE_ID', { infer: true })?.trim(),
      [SubscriptionPlan.Gestor]: this.config.get('STRIPE_GESTOR_PRICE_ID', { infer: true })?.trim(),
    };

    const priceId = map[plan];

    if (!priceId) {
      throw new BusinessRuleError(`Price ID Stripe não configurado para o plano ${plan}.`);
    }

    return priceId;
  }

  planFromPriceId(priceId: string): SubscriptionPlan | null {
    const lite = this.config.get('STRIPE_PRICE_ID', { infer: true })?.trim();
    const prime = this.config.get('STRIPE_PRIME_PRICE_ID', { infer: true })?.trim();
    const gestor = this.config.get('STRIPE_GESTOR_PRICE_ID', { infer: true })?.trim();

    if (priceId === lite) {
      return SubscriptionPlan.Lite;
    }

    if (priceId === prime) {
      return SubscriptionPlan.Prime;
    }

    if (priceId === gestor) {
      return SubscriptionPlan.Gestor;
    }

    return null;
  }

  publicAppUrl(): string {
    const configured = this.config.get('PUBLIC_APP_URL', { infer: true })?.trim();
    const fromCors = this.config
      .get('CORS_ORIGINS', { infer: true })
      .split(',')
      .map((origin) => origin.trim())
      .find(Boolean);

    const base = (configured || fromCors || '').replace(/\/+$/, '');

    if (!base) {
      throw new BusinessRuleError('Configure PUBLIC_APP_URL (ou CORS_ORIGINS) para o checkout.');
    }

    return base;
  }
}
