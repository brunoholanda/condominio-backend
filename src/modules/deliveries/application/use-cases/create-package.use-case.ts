import { Injectable } from '@nestjs/common';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { ListCondoUnitsUseCase } from '../../../condominiums/application/use-cases/list-condo-units.use-case';
import { Package } from '../../domain/entities/package';
import { PackageRepository } from '../../domain/repositories/package.repository';
import type { CreatePackageDto } from '../dto/create-package.dto';
import type { PackageResponseDto } from '../dto/package-response.dto';
import { PackagePresenter } from '../presenters/package.presenter';

@Injectable()
export class CreatePackageUseCase {
  constructor(
    private readonly packages: PackageRepository,
    private readonly listCondoUnits: ListCondoUnitsUseCase,
  ) {}

  async execute(
    input: CreatePackageDto,
    condominiumId: string,
    receivedByUserId: string,
  ): Promise<PackageResponseDto> {
    const units = await this.listCondoUnits.byId(condominiumId);
    const unitNumber = input.unitNumber.trim();

    if (!units.includes(unitNumber)) {
      throw new BusinessRuleError('Informe uma unidade existente neste condomínio.');
    }

    const parcel = await this.packages.save(
      Package.create({
        condominiumId,
        unitNumber,
        description: input.description,
        carrier: input.carrier,
        notes: input.notes,
        receivedByUserId,
      }),
    );

    return PackagePresenter.toResponse(parcel);
  }

  async executeAsEmployee(
    input: CreatePackageDto,
    condominiumId: string,
    receivedByEmployeeId: string,
  ): Promise<PackageResponseDto> {
    const units = await this.listCondoUnits.byId(condominiumId);
    const unitNumber = input.unitNumber.trim();

    if (!units.includes(unitNumber)) {
      throw new BusinessRuleError('Informe uma unidade existente neste condomínio.');
    }

    const parcel = await this.packages.save(
      Package.create({
        condominiumId,
        unitNumber,
        description: input.description,
        carrier: input.carrier,
        notes: input.notes,
        receivedByEmployeeId,
      }),
    );

    return PackagePresenter.toResponse(parcel);
  }
}
