import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { EnvironmentVariables } from '../../../config/environment';

const PREFIX = 'enc:v1:';

/**
 * AES-256-GCM para segredos em repouso (ex.: API key Asaas).
 * Valores sem prefixo são tratados como texto plano legado e recriptografados na leitura.
 */
@Injectable()
export class SecretBox {
  private readonly key: Buffer;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    const explicit = config.get('ENCRYPTION_KEY', { infer: true });
    const jwtSecret = config.get('JWT_SECRET', { infer: true });
    const material =
      typeof explicit === 'string' && explicit.trim().length >= 32 ? explicit.trim() : jwtSecret;
    this.key = createHash('sha256').update(material).digest();
  }

  encrypt(plain: string): string {
    if (!plain || plain.startsWith(PREFIX)) {
      return plain;
    }

    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return `${PREFIX}${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
  }

  decrypt(stored: string): string {
    if (!stored.startsWith(PREFIX)) {
      return stored;
    }

    const raw = stored.slice(PREFIX.length);
    const [ivB64, tagB64, dataB64] = raw.split('.');

    if (!ivB64 || !tagB64 || !dataB64) {
      throw new Error('Segredo criptografado inválido.');
    }

    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(ivB64, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));

    return Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }

  isEncrypted(stored: string): boolean {
    return stored.startsWith(PREFIX);
  }
}
