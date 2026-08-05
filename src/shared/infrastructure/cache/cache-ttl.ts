/** TTLs in seconds — short for auth-sensitive data, long for external APIs. */
export const CacheTtl = {
  /** Membership checked on nearly every condo API request. */
  membership: 10 * 60,

  /** Condo aggregate + unit catalog. */
  condominium: 20 * 60,

  /** User plan / role / active flag (SystemOwnerGuard, /me, plan limits). */
  user: 5 * 60,

  /** Resident portal access by slug. */
  residentAccount: 10 * 60,

  /** ViaCEP + Nominatim — immutable-ish external data. */
  cep: 30 * 24 * 60 * 60,

  geocode: 7 * 24 * 60 * 60,

  /** Brief negative cache so repeated unauthorized hits skip Postgres. */
  negative: 60,
} as const;
