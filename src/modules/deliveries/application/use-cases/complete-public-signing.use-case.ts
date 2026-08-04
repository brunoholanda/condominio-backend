import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import type { DeliverPackageDto } from '../dto/deliver-package.dto';
import type { CompletePublicSigningResponseDto } from '../dto/public-signing-session.dto';
import { PackageSigningSessionRepository } from '../../domain/repositories/package-signing-session.repository';
import { PackageRepository } from '../../domain/repositories/package.repository';
import { DeliverPackageUseCase } from './deliver-package.use-case';

/** System actor used when nobody at the lobby is available to be the deliverer of record. */
export const SYSTEM_DELIVERY_USER_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Consumes a remote signing link: protocols the delivery on behalf of whoever
 * received the package, then closes the door on the token.
 */
@Injectable()
export class CompletePublicSigningUseCase {
  constructor(
    private readonly sessions: PackageSigningSessionRepository,
    private readonly packages: PackageRepository,
    private readonly deliverPackage: DeliverPackageUseCase,
  ) {}

  async execute(token: string, input: DeliverPackageDto): Promise<CompletePublicSigningResponseDto> {
    const session = await this.sessions.findByToken(token);

    if (!session) {
      throw new ResourceNotFoundError('Link de assinatura não encontrado.');
    }

    session.ensureUsable();

    const parcel = await this.packages.findById(session.packageId);

    if (!parcel) {
      throw new ResourceNotFoundError('Encomenda não encontrada.');
    }

    const deliveredByUserId = parcel.toSnapshot().receivedByUserId ?? SYSTEM_DELIVERY_USER_ID;

    const delivered = await this.deliverPackage.execute(
      parcel.id,
      parcel.condominiumId,
      deliveredByUserId,
      input,
    );

    await this.sessions.save(session.consume());

    return { deliveredAt: delivered.deliveredAt ?? new Date().toISOString() };
  }
}
