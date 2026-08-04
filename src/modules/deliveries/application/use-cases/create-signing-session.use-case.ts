import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import QRCode from 'qrcode';

import type { EnvironmentVariables } from '../../../../config/environment';
import { BusinessRuleError, ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { PackageSigningSession } from '../../domain/entities/package-signing-session';
import { PackageStatus } from '../../domain/enums/package-status';
import { PackageSigningSessionRepository } from '../../domain/repositories/package-signing-session.repository';
import { PackageRepository } from '../../domain/repositories/package.repository';
import type { SigningSessionResponseDto } from '../dto/signing-session-response.dto';

/**
 * Lets the lobby hand a package's signature capture to a phone: a QR Code
 * opens a short-lived link where the recipient signs on their own screen.
 */
@Injectable()
export class CreateSigningSessionUseCase {
  constructor(
    private readonly packages: PackageRepository,
    private readonly sessions: PackageSigningSessionRepository,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async execute(id: string, condominiumId: string): Promise<SigningSessionResponseDto> {
    const parcel = await this.packages.findById(id, condominiumId);

    if (!parcel) {
      throw new ResourceNotFoundError('Encomenda não encontrada.');
    }

    if (parcel.status !== PackageStatus.Waiting) {
      throw new BusinessRuleError('Esta encomenda já foi entregue.');
    }

    const reused = await this.sessions.findValidByPackageId(id);
    const session = reused ?? (await this.sessions.save(PackageSigningSession.issue({ packageId: id })));

    return this.toResponse(session);
  }

  private async toResponse(session: PackageSigningSession): Promise<SigningSessionResponseDto> {
    const signUrl = `${this.resolvePublicAppUrl()}/assinar-entrega/${session.token}`;

    return {
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
      signUrl,
      qrPngDataUrl: await this.buildQrCode(signUrl),
    };
  }

  private async buildQrCode(signUrl: string): Promise<string> {
    return QRCode.toDataURL(signUrl, { errorCorrectionLevel: 'M', margin: 2, width: 320 });
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
        'Configure PUBLIC_APP_URL (ou CORS_ORIGINS) para gerar o link de assinatura.',
      );
    }

    return base;
  }
}
