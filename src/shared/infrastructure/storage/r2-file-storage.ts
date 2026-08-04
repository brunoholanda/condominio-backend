import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { EnvironmentVariables } from '../../../config/environment';
import { FileStorage } from '../../application/ports/file-storage';
import { BusinessRuleError, ResourceNotFoundError } from '../../domain/domain-error';
import { StorageKeys } from './storage-keys';

/** Persistência única de arquivos no Cloudflare R2 (API S3-compatível). */
@Injectable()
export class R2FileStorage extends FileStorage implements OnModuleInit {
  private readonly logger = new Logger(R2FileStorage.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    super();

    const endpoint = config.get('R2_ENDPOINT', { infer: true });
    const region = config.get('R2_REGION', { infer: true });
    const accessKeyId = config.get('R2_ACCESS_KEY_ID', { infer: true });
    const secretAccessKey = config.get('R2_SECRET_ACCESS_KEY', { infer: true });

    this.bucket = config.get('R2_BUCKET', { infer: true });
    this.client = new S3Client({
      region,
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });
  }

  onModuleInit(): void {
    this.logger.log(`Armazenamento de arquivos: Cloudflare R2 (bucket ${this.bucket}).`);
  }

  async save(buffer: Buffer, key: string, mimeType: string): Promise<void> {
    const objectKey = StorageKeys.assertSafeKey(key);

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: objectKey,
          Body: buffer,
          ContentType: mimeType || 'application/octet-stream',
        }),
      );
    } catch (error: unknown) {
      this.logger.error(`Falha ao gravar ${objectKey} no R2`, errorStack(error));
      throw new BusinessRuleError('Não foi possível salvar o arquivo. Tente novamente.');
    }
  }

  async read(key: string): Promise<Buffer> {
    const objectKey = StorageKeys.assertSafeKey(key);

    try {
      const response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: objectKey,
        }),
      );

      if (!response.Body) {
        throw new ResourceNotFoundError('Arquivo não encontrado.');
      }

      const bytes = await response.Body.transformToByteArray();

      return Buffer.from(bytes);
    } catch (error: unknown) {
      if (error instanceof ResourceNotFoundError) {
        throw error;
      }

      if (isNotFoundError(error)) {
        throw new ResourceNotFoundError('Arquivo não encontrado.');
      }

      this.logger.error(`Falha ao ler ${objectKey} no R2`, errorStack(error));
      throw new BusinessRuleError('Não foi possível abrir o arquivo. Tente novamente.');
    }
  }

  async delete(key: string): Promise<void> {
    const objectKey = StorageKeys.assertSafeKey(key);

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: objectKey,
        }),
      );
    } catch (error: unknown) {
      if (isNotFoundError(error)) {
        return;
      }

      this.logger.error(`Falha ao remover ${objectKey} no R2`, errorStack(error));
      throw new BusinessRuleError('Não foi possível remover o arquivo. Tente novamente.');
    }
  }
}

function errorStack(error: unknown): string | undefined {
  return error instanceof Error ? error.stack : undefined;
}

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const name = 'name' in error ? String(error.name) : '';
  const code =
    '$metadata' in error &&
    error.$metadata &&
    typeof error.$metadata === 'object' &&
    'httpStatusCode' in error.$metadata
      ? Number(error.$metadata.httpStatusCode)
      : undefined;

  return name === 'NoSuchKey' || name === 'NotFound' || code === 404;
}
