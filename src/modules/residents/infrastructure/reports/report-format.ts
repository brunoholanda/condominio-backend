const EMPTY = '—';

/** Formatting for print: the API stores raw values and the document has no UI to mask them. */
export const reportFormat = {
  text(value?: string | null): string {
    return value?.trim() ? value.trim() : EMPTY;
  },

  cpf(value: string): string {
    return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  },

  phone(value?: string | null): string {
    if (!value) {
      return EMPTY;
    }

    return value
      .replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
      .replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  },

  plate(value: string): string {
    return value.replace(/^([A-Z]{3})(\w{4})$/, '$1-$2');
  },

  /** `2023-03-15` as sent by the API. */
  date(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');

    return day && month && year ? `${day}/${month}/${year}` : isoDate;
  },

  dateTime(isoTimestamp: string): string {
    const date = new Date(isoTimestamp);

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Sao_Paulo',
    }).format(date);
  },
} as const;
