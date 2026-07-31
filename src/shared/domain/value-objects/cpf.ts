import { InvalidFieldError } from '../domain-error';
import { onlyDigits } from '../guards';
import { ValueObject } from '../value-object';

const CPF_LENGTH = 11;

/**
 * Brazilian taxpayer id. Stored unformatted (digits only) so lookups are stable
 * regardless of how the user typed it.
 */
export class Cpf extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(raw: string, field = 'cpf'): Cpf {
    const digits = onlyDigits(String(raw ?? ''));

    if (!Cpf.isValid(digits)) {
      throw new InvalidFieldError(field, `O CPF informado é inválido.`);
    }

    return new Cpf(digits);
  }

  static isValid(raw: string): boolean {
    const digits = onlyDigits(String(raw ?? ''));

    if (digits.length !== CPF_LENGTH || /^(\d)\1{10}$/.test(digits)) {
      return false;
    }

    return (
      Cpf.checkDigit(digits, 9) === Number(digits[9]) &&
      Cpf.checkDigit(digits, 10) === Number(digits[10])
    );
  }

  /** Modulo 11 check digit over the first `length` digits. */
  private static checkDigit(digits: string, length: number): number {
    let sum = 0;

    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * (length + 1 - index);
    }

    const remainder = (sum * 10) % CPF_LENGTH;

    return remainder === 10 ? 0 : remainder;
  }

  get formatted(): string {
    return this.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
