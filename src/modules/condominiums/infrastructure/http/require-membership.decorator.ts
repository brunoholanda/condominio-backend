import { SetMetadata } from '@nestjs/common';

import type { MembershipRole } from '../../domain/enums/membership-role';

export const MEMBERSHIP_ROLES_KEY = 'condominiums:membershipRoles';

/**
 * Restricts a route (already guarded by `CondominiumAccessGuard`) to specific
 * roles inside the condo. Without it, any membership role is accepted.
 */
export const RequireMembership = (...roles: MembershipRole[]) =>
  SetMetadata(MEMBERSHIP_ROLES_KEY, roles);
