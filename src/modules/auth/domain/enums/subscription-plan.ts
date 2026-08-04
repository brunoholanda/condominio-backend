export enum SubscriptionPlan {
  Lite = 'lite',
  Prime = 'prime',
  Gestor = 'gestor',
}

export const SUBSCRIPTION_PLANS = Object.values(SubscriptionPlan);

/** Lite marketing limit: at most 10 units in the condo catalog. */
export const LITE_MAX_UNITS = 10;

export function isLimitedCondoPlan(plan: SubscriptionPlan): boolean {
  return plan === SubscriptionPlan.Lite || plan === SubscriptionPlan.Prime;
}
