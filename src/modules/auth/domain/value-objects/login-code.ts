import { randomInt } from 'node:crypto';

import { InvalidFieldError } from '../../../../shared/domain/domain-error';
import { onlyDigits } from '../../../../shared/domain/guards';
import { ValueObject } from '../../../../shared/domain/value-object';

const LENGTH = 6;
const UPPER_BOUND = 10 ** LENGTH;

/**
 * Código de uso único enviado por e-mail na segunda etapa do login. São seis
 * dígitos porque é o que uma pessoa consegue copiar do celular sem errar; o que
 * segura a força bruta é o prazo curto e o limite de tentativas do desafio.
 */
export class LoginCode extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  /** `randomInt` usa o gerador criptográfico do sistema, não `Math.random`. */
  static random(): LoginCode {
    return new LoginCode(String(randomInt(0, UPPER_BOUND)).padStart(LENGTH, '0'));
  }

  static create(raw: string): LoginCode {
    const digits = onlyDigits(String(raw ?? ''));

    if (digits.length !== LENGTH) {
      throw new InvalidFieldError('código', `O código deve ter ${LENGTH} dígitos.`);
    }

    return new LoginCode(digits);
  }

  static isValid(raw: string): boolean {
    return onlyDigits(String(raw ?? '')).length === LENGTH;
  }
}
