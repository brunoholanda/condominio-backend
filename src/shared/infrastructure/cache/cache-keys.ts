/** Centralized Redis key builders — keep naming consistent across repositories. */
export const CacheKeys = {
  membership: (userId: string, condominiumId: string) =>
    `membership:u:${userId}:c:${condominiumId}`,

  membershipsByUser: (userId: string) => `memberships:user:${userId}`,

  membershipsByCondo: (condominiumId: string) => `memberships:condo:${condominiumId}`,

  condominiumById: (id: string) => `condo:id:${id}`,

  condominiumBySlug: (slug: string) => `condo:slug:${slug.toLowerCase()}`,

  condoUnits: (condominiumId: string) => `condo:units:${condominiumId}`,

  condoVacantUnits: (condominiumId: string) => `condo:vacant:${condominiumId}`,

  userById: (id: string) => `user:id:${id}`,

  userByEmail: (email: string) => `user:email:${email.toLowerCase()}`,

  residentAccount: (userId: string, condominiumId: string) =>
    `resident-account:u:${userId}:c:${condominiumId}`,

  cep: (digits: string) => `cep:${digits}`,

  geocode: (normalizedQuery: string) => `geo:q:${normalizedQuery}`,

  geoSuggest: (normalizedQuery: string) => `geo:suggest:${normalizedQuery}`,
} as const;

/** Normalizes free-text queries so geocode/suggest cache keys stay stable. */
export function normalizeGeoQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 200);
}
