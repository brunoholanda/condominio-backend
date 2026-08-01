import { InvalidFieldError } from '../domain-error';
import { ValueObject } from '../value-object';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const MAX_LENGTH = 254;
const VISIBLE_LOCAL_CHARS = 2;
const SHORT_LOCAL_LENGTH = 4;
const MASK = '*****';

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

  /**
   * Versão com o meio escondido (`ho*****es@dominio.com`), suficiente para a
   * pessoa reconhecer a própria caixa sem que a tela mostre o endereço inteiro.
   * A máscara tem tamanho fixo para não denunciar o comprimento do endereço.
   */
  get masked(): string {
    const [local, domain] = this.value.split('@');
    const edge = local.length <= SHORT_LOCAL_LENGTH ? 1 : VISIBLE_LOCAL_CHARS;

    return `${local.slice(0, edge)}${MASK}${local.slice(-edge)}@${domain}`;
  }
}
