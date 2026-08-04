import { InvalidFieldError } from '../../../../shared/domain/domain-error';
import { ValueObject } from '../../../../shared/domain/value-object';

const MIN_LENGTH = 3;
const MAX_LENGTH = 80;
const PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Identifies a condo in public URLs (`/c/:slug`). Lowercase, kebab-case. */
export class Slug extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(raw: string, field = 'slug'): Slug {
    const value = String(raw ?? '')
      .trim()
      .toLowerCase();

    if (!Slug.isValid(value)) {
      throw new InvalidFieldError(
        field,
        `O campo "${field}" deve ter entre ${MIN_LENGTH} e ${MAX_LENGTH} caracteres, usando apenas letras minúsculas, números e hífen (ex.: meu-condominio).`,
      );
    }

    return new Slug(value);
  }

  static isValid(raw: string): boolean {
    const value = String(raw ?? '')
      .trim()
      .toLowerCase();

    return value.length >= MIN_LENGTH && value.length <= MAX_LENGTH && PATTERN.test(value);
  }
}
