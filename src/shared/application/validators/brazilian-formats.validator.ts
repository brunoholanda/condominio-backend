import { registerDecorator, type ValidationOptions } from 'class-validator';

import { Cpf } from '../../domain/value-objects/cpf';
import { LicensePlate } from '../../domain/value-objects/license-plate';
import { PhoneNumber } from '../../domain/value-objects/phone-number';
import { SignatureImage } from '../../domain/value-objects/signature-image';

type Rule = (value: string) => boolean;

/**
 * Bridges class-validator to the domain value objects so the format rules have a
 * single implementation, used both at the HTTP boundary and inside the aggregate.
 */
function createFormatDecorator(name: string, isValid: Rule, message: string) {
  return (validationOptions?: ValidationOptions): PropertyDecorator =>
    (target: object, propertyName: string | symbol): void => {
      registerDecorator({
        name,
        target: target.constructor,
        propertyName: propertyName as string,
        options: { message, ...validationOptions },
        validator: {
          validate: (value: unknown): boolean => typeof value === 'string' && isValid(value),
        },
      });
    };
}

export const IsCpf = createFormatDecorator(
  'isCpf',
  (value) => Cpf.isValid(value),
  'O CPF informado é inválido.',
);

export const IsBrazilianPhone = createFormatDecorator(
  'isBrazilianPhone',
  (value) => PhoneNumber.isValid(value),
  'Informe um telefone válido com DDD (10 ou 11 dígitos).',
);

export const IsLicensePlate = createFormatDecorator(
  'isLicensePlate',
  (value) => LicensePlate.isValid(value),
  'Informe uma placa válida (ABC1234 ou ABC1D23).',
);

export const IsSignatureImage = createFormatDecorator(
  'isSignatureImage',
  (value) => SignatureImage.isValid(value),
  'Não foi possível registrar a assinatura. Assine novamente.',
);
