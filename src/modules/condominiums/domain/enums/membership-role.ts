/** What an account can do inside a condo. */
export enum MembershipRole {
  /** Created the condo; full control, including other memberships. */
  Owner = 'OWNER',
  /** Runs the condo day-to-day: finance, common areas, documents. */
  Manager = 'MANAGER',
  /** Operates the residents registry only. */
  Operator = 'OPERATOR',
  /** Portaria: encomendas e visitantes (cadastro e check-in). */
  Doorman = 'DOORMAN',
}

export const MANAGEMENT_ROLES = [MembershipRole.Owner, MembershipRole.Manager] as const;

/** Who may operate the packages desk. */
export const DELIVERY_ROLES = [
  MembershipRole.Owner,
  MembershipRole.Manager,
  MembershipRole.Doorman,
] as const;
