import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { CondominiumRepository } from '../../../condominiums/domain/repositories/condominium.repository';
import { PackageSigningSessionRepository } from '../../domain/repositories/package-signing-session.repository';
import { PackageRepository } from '../../domain/repositories/package.repository';
import type { PublicSigningSessionDto } from '../dto/public-signing-session.dto';

/** What the recipient sees on their phone before agreeing to sign. */
@Injectable()
export class GetPublicSigningSessionUseCase {
  constructor(
    private readonly sessions: PackageSigningSessionRepository,
    private readonly packages: PackageRepository,
    private readonly condominiums: CondominiumRepository,
  ) {}

  async execute(token: string): Promise<PublicSigningSessionDto> {
    const session = await this.sessions.findByToken(token);

    if (!session) {
      throw new ResourceNotFoundError('Link de assinatura não encontrado.');
    }

    session.ensureUsable();

    const parcel = await this.packages.findById(session.packageId);

    if (!parcel) {
      throw new ResourceNotFoundError('Encomenda não encontrada.');
    }

    const condominium = await this.condominiums.findById(parcel.condominiumId);

    if (!condominium) {
      throw new ResourceNotFoundError('Condomínio não encontrado.');
    }

    const snapshot = parcel.toSnapshot();

    return {
      condominiumName: condominium.name,
      unitNumber: snapshot.unitNumber,
      description: snapshot.description,
      expiresAt: session.expiresAt.toISOString(),
    };
  }
}
