import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'auth:isPublic';

/**
 * Opens a route to unauthenticated callers.
 *
 * Authentication is enforced globally, so every new endpoint is protected by
 * default and only becomes public when this decorator is applied on purpose.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
