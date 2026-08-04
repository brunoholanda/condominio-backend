import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { PackageRepository } from '../../domain/repositories/package.repository';
import type { DeliverPackageDto } from '../dto/deliver-package.dto';
import type { PackageResponseDto } from '../dto/package-response.dto';
import { PackagePresenter } from '../presenters/package.presenter';

@Injectable()
export class DeliverPackageUseCase {
  constructor(private readonly packages: PackageRepository) {}

  async execute(
    id: string,
    condominiumId: string,
    deliveredByUserId: string,
    input: DeliverPackageDto,
  ): Promise<PackageResponseDto> {
    const parcel = await this.packages.findById(id, condominiumId);

    if (!parcel) {
      throw new ResourceNotFoundError('Encomenda não encontrada.');
    }

    const delivered = await this.packages.save(
      parcel.deliver({
        recipientName: input.recipientName,
        signature: input.signature,
        deliveredByUserId,
      }),
    );

    return PackagePresenter.toResponse(delivered);
  }
}
