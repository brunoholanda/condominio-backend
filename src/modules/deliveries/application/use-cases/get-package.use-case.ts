import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { PackageRepository } from '../../domain/repositories/package.repository';
import type { PackageResponseDto } from '../dto/package-response.dto';
import { PackagePresenter } from '../presenters/package.presenter';

@Injectable()
export class GetPackageUseCase {
  constructor(private readonly packages: PackageRepository) {}

  async execute(id: string, condominiumId: string): Promise<PackageResponseDto> {
    const parcel = await this.packages.findById(id, condominiumId);

    if (!parcel) {
      throw new ResourceNotFoundError('Encomenda não encontrada.');
    }

    return PackagePresenter.toResponse(parcel);
  }
}
