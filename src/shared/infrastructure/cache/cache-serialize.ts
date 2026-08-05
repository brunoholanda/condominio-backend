/** Revive ISO date strings produced by JSON.stringify of domain snapshots. */
export function reviveDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? null : date;
}

export function requireRevivedDate(value: unknown, field: string): Date {
  const date = reviveDate(value);

  if (!date) {
    throw new Error(`Cache corrompido: campo de data "${field}" inválido.`);
  }

  return date;
}
