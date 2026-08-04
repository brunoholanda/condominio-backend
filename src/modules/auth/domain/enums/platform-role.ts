/** Cross-tenant role on the platform (not tied to a single condominium). */
export enum PlatformRole {
  SystemOwner = 'SYSTEM_OWNER',
}

export function isSystemOwnerRole(role: PlatformRole | string | null | undefined): boolean {
  return role === PlatformRole.SystemOwner;
}
