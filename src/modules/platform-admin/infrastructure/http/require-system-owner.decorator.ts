import { SetMetadata } from '@nestjs/common';

export const REQUIRE_SYSTEM_OWNER_KEY = 'auth:requireSystemOwner';

/** Restricts a route to platform system owners. */
export const RequireSystemOwner = () => SetMetadata(REQUIRE_SYSTEM_OWNER_KEY, true);
