import { InvalidFieldError } from '../../../../shared/domain/domain-error';
import { ValueObject } from '../../../../shared/domain/value-object';

const FLOORS = [1, 2, 3, 4] as const;
const APARTMENTS_PER_FLOOR = 17;

function buildCatalog(): string[] {
  return FLOORS.flatMap((floor) =>
    Array.from(
      { length: APARTMENTS_PER_FLOOR },
      (_value, index) => `${floor}${String(index + 1).padStart(2, '0')}`,
    ),
  );
}

/** The condo has 68 apartments: 101–117, 201–217, 301–317 and 401–417. */
export const CONDO_UNITS: readonly string[] = Object.freeze(buildCatalog());

export const TOTAL_UNITS = CONDO_UNITS.length;

const CATALOG = new Set(CONDO_UNITS);

/** Apartment of the condo. Only numbers that exist in the building are accepted. */
export class Unit extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(raw: string, field = 'unit'): Unit {
    const value = String(raw ?? '').trim();

    if (!Unit.isValid(value)) {
      throw new InvalidFieldError(
        field,
        'Informe uma unidade existente no condomínio (101 a 117, 201 a 217, 301 a 317 ou 401 a 417).',
      );
    }

    return new Unit(value);
  }

  static isValid(raw: string): boolean {
    return CATALOG.has(String(raw ?? '').trim());
  }

  get floor(): number {
    return Number(this.value[0]);
  }
}
