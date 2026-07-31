import { InvalidFieldError } from '../../../shared/domain/domain-error';

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 72;

/**
 * Minimum strength accepted when a password is defined.
 * The upper bound exists because bcrypt silently ignores bytes beyond 72.
 */
export function assertPasswordPolicy(password: string): string {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw new InvalidFieldError(
      'senha',
      `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`,
    );
  }

  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_LENGTH) {
    throw new InvalidFieldError(
      'senha',
      `A senha deve ter no máximo ${MAX_PASSWORD_LENGTH} bytes.`,
    );
  }

  return password;
}
