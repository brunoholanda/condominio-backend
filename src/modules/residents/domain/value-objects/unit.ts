import { InvalidFieldError } from '../../../../shared/domain/domain-error';
import { ValueObject } from '../../../../shared/domain/value-object';

const MAX_LENGTH = 20;

const FLOORS = [1, 2, 3, 4] as const;
const APARTMENTS_PER_FLOOR = 17;

/**
 * Apartment/unit identifier. Each condo owns its own catalog (see
 * `condominiums` module), so the value object only enforces the generic shape;
 * whether the unit actually exists in a given condo is a use case concern.
 */
export class Unit extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(raw: string, field = 'unidade'): Unit {
    const value = String(raw ?? '').trim();

    if (!Unit.isValid(value)) {
      throw new InvalidFieldError(
        field,
        `O campo "${field}" deve ter entre 1 e ${MAX_LENGTH} caracteres.`,
      );
    }

    return new Unit(value);
  }

  static isValid(raw: string): boolean {
    const value = String(raw ?? '').trim();

    return value.length > 0 && value.length <= MAX_LENGTH;
  }
}

/**
 * Seed helper for the first tenant (Porto Imperial): 68 apartments across four
 * floors, numbered 101–117, 201–217, 301–317 and 401–417.
 */
export function buildPortoImperialUnits(): string[] {
  return FLOORS.flatMap((floor) =>
    Array.from(
      { length: APARTMENTS_PER_FLOOR },
      (_value, index) => `${floor}${String(index + 1).padStart(2, '0')}`,
    ),
  );
}
