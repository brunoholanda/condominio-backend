import { InvalidFieldError } from './domain-error';

interface TextConstraints {
  min?: number;
  max?: number;
}

/** Normalizes whitespace and asserts the text fits the expected length range. */
export function requireText(
  field: string,
  value: unknown,
  constraints: TextConstraints = {},
): string {
  const { min = 1, max = 255 } = constraints;
  const normalized = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';

  if (normalized.length < min) {
    throw new InvalidFieldError(
      field,
      `O campo "${field}" deve ter no mínimo ${min} caractere(s).`,
    );
  }

  if (normalized.length > max) {
    throw new InvalidFieldError(field, `O campo "${field}" deve ter no máximo ${max} caracteres.`);
  }

  return normalized;
}

/** Same as `requireText`, but empty/absent values become `null` instead of failing. */
export function optionalText(
  field: string,
  value: unknown,
  constraints: TextConstraints = {},
): string | null {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  return requireText(field, value, constraints);
}

export function requireEnum<TEnum extends Record<string, string>>(
  field: string,
  value: unknown,
  allowed: TEnum,
): TEnum[keyof TEnum] {
  const options = Object.values(allowed);

  if (typeof value !== 'string' || !options.includes(value)) {
    throw new InvalidFieldError(
      field,
      `O campo "${field}" deve ser um dos valores: ${options.join(', ')}.`,
    );
  }

  return value as TEnum[keyof TEnum];
}

export function requireDate(field: string, value: unknown): Date {
  const date = value instanceof Date ? value : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    throw new InvalidFieldError(field, `O campo "${field}" deve conter uma data válida.`);
  }

  return date;
}

export function requireNotInFuture(field: string, value: Date): Date {
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  if (value.getTime() > endOfToday.getTime()) {
    throw new InvalidFieldError(field, `O campo "${field}" não pode ser uma data futura.`);
  }

  return value;
}

export function requireTrue(field: string, value: unknown, message: string): true {
  if (value !== true) {
    throw new InvalidFieldError(field, message);
  }

  return true;
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}
