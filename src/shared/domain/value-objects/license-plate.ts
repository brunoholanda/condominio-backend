import { InvalidFieldError } from '../domain-error';
import { ValueObject } from '../value-object';

const LEGACY_PATTERN = /^[A-Z]{3}\d{4}$/;
const MERCOSUL_PATTERN = /^[A-Z]{3}\d[A-Z]\d{2}$/;

/** Vehicle plate in either the legacy (ABC1234) or Mercosul (ABC1D23) format. */
export class LicensePlate extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(raw: string, field = 'placa'): LicensePlate {
    const normalized = LicensePlate.normalize(raw);

    if (!LicensePlate.isValid(normalized)) {
      throw new InvalidFieldError(field, 'A placa informada é inválida (use ABC1234 ou ABC1D23).');
    }

    return new LicensePlate(normalized);
  }

  static isValid(raw: string): boolean {
    const normalized = LicensePlate.normalize(raw);

    return LEGACY_PATTERN.test(normalized) || MERCOSUL_PATTERN.test(normalized);
  }

  private static normalize(raw: string): string {
    return String(raw ?? '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  }

  get formatted(): string {
    return `${this.value.slice(0, 3)}-${this.value.slice(3)}`;
  }
}
