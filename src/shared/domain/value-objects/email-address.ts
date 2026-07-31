import { InvalidFieldError } from '../domain-error';
import { ValueObject } from '../value-object';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const MAX_LENGTH = 254;

export class EmailAddress extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(raw: string, field = 'email'): EmailAddress {
    const normalized = String(raw ?? '')
      .trim()
      .toLowerCase();

    if (!EmailAddress.isValid(normalized)) {
      throw new InvalidFieldError(field, 'O e-mail informado é inválido.');
    }

    return new EmailAddress(normalized);
  }

  static isValid(raw: string): boolean {
    const normalized = String(raw ?? '').trim();

    return normalized.length <= MAX_LENGTH && EMAIL_PATTERN.test(normalized);
  }
}
