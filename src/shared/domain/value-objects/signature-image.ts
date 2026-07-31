import { InvalidFieldError } from '../domain-error';
import { ValueObject } from '../value-object';

const DATA_URL_PATTERN = /^data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/;

/** Storage ceiling for a handwritten signature, in bytes. */
export const MAX_SIGNATURE_BYTES = 256 * 1024;

/**
 * Handwritten signature captured on screen, kept as a base64 data URL.
 *
 * The client is responsible for downscaling the drawing until it fits, so this
 * limit is a safety net and its message never mentions sizes: from the
 * resident's point of view there is nothing to configure, only to sign again.
 */
export class SignatureImage extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(raw: unknown, field = 'assinatura'): SignatureImage {
    if (typeof raw !== 'string' || !DATA_URL_PATTERN.test(raw)) {
      throw new InvalidFieldError(field, 'A assinatura enviada é inválida. Assine novamente.');
    }

    if (SignatureImage.byteLength(raw) > MAX_SIGNATURE_BYTES) {
      throw new InvalidFieldError(
        field,
        'Não foi possível registrar a assinatura. Assine novamente.',
      );
    }

    return new SignatureImage(raw);
  }

  static isValid(raw: string): boolean {
    return DATA_URL_PATTERN.test(raw) && SignatureImage.byteLength(raw) <= MAX_SIGNATURE_BYTES;
  }

  /** Decoded size of the image, without decoding the payload itself. */
  private static byteLength(dataUrl: string): number {
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;

    return (base64.length * 3) / 4 - padding;
  }

  get sizeInBytes(): number {
    return SignatureImage.byteLength(this.value);
  }
}
