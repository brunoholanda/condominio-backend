import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { EnvironmentVariables } from '../../../../config/environment';
import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import {
  PUBLIC_QR_TARGET_LABELS,
  publicPathForTarget,
  type PublicQrTarget,
} from '../../domain/public-qr-target';
import { PdfKitPublicQrGenerator } from '../../infrastructure/reports/pdfkit-public-qr.generator';
import { GetCondominiumUseCase } from './get-condominium.use-case';

export interface PublicQrPdfResult {
  fileName: string;
  content: Buffer;
}

/** Builds a printable QR PDF that opens a public condo URL. */
@Injectable()
export class GeneratePublicQrPdfUseCase {
  constructor(
    private readonly getCondominium: GetCondominiumUseCase,
    private readonly generator: PdfKitPublicQrGenerator,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async execute(condominiumId: string, target: PublicQrTarget = 'hub'): Promise<PublicQrPdfResult> {
    const condominium = await this.getCondominium.getOrFail(condominiumId);
    const baseUrl = this.resolvePublicAppUrl();
    const slug = condominium.slug.value;
    const path = publicPathForTarget(slug, target);
    const publicUrl = `${baseUrl}${path}`;

    const content = await this.generator.generate({
      condominiumName: condominium.name,
      targetLabel: PUBLIC_QR_TARGET_LABELS[target],
      publicUrl,
    });

    const safeSlug = slug.replace(/[^a-z0-9-]+/gi, '-');
    const fileName = `qr-${safeSlug}-${target}.pdf`;

    return { fileName, content };
  }

  private resolvePublicAppUrl(): string {
    const configured = this.config.get('PUBLIC_APP_URL', { infer: true })?.trim();
    const fromCors = this.config
      .get('CORS_ORIGINS', { infer: true })
      .split(',')
      .map((origin) => origin.trim())
      .find(Boolean);

    const base = (configured || fromCors || '').replace(/\/+$/, '');

    if (!base) {
      throw new BusinessRuleError(
        'Configure PUBLIC_APP_URL (ou CORS_ORIGINS) para gerar o QR Code do link público.',
      );
    }

    return base;
  }
}
