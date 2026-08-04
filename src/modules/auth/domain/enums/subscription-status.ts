export enum SubscriptionStatus {
  Trialing = 'TRIALING',
  Active = 'ACTIVE',
  PastDue = 'PAST_DUE',
  Canceled = 'CANCELED',
}

export const SUBSCRIPTION_STATUSES = Object.values(SubscriptionStatus);
