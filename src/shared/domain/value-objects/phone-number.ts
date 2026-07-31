import { InvalidFieldError } from '../domain-error';
import { onlyDigits } from '../guards';
import { ValueObject } from '../value-object';

const LANDLINE_LENGTH = 10;
const MOBILE_LENGTH = 11;

/**
 * Brazilian phone number stored as digits only (`DDD + number`).
 * Accepts both landlines (10 digits) and mobiles (11 digits, starting with 9).
 */
export class PhoneNumber extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(raw: string, field = 'telefone'): PhoneNumber {
    const digits = onlyDigits(String(raw ?? ''));

    if (!PhoneNumber.isValid(digits)) {
      throw new InvalidFieldError(
        field,
        `O campo "${field}" deve conter um telefone válido com DDD.`,
      );
    }

    return new PhoneNumber(digits);
  }

  static isValid(raw: string): boolean {
    const digits = onlyDigits(String(raw ?? ''));

    if (digits.length !== LANDLINE_LENGTH && digits.length !== MOBILE_LENGTH) {
      return false;
    }

    const areaCode = Number(digits.slice(0, 2));

    if (areaCode < 11 || areaCode > 99) {
      return false;
    }

    return digits.length === MOBILE_LENGTH ? digits[2] === '9' : /^[2-5]/.test(digits.slice(2));
  }

  get isMobile(): boolean {
    return this.value.length === MOBILE_LENGTH;
  }

  get formatted(): string {
    return this.isMobile
      ? this.value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      : this.value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
}
