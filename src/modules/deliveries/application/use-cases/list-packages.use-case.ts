import { Injectable } from '@nestjs/common';

import type { PaginatedResult } from '../../../../shared/application/paginated-result';
import { PackageRepository } from '../../domain/repositories/package.repository';
import type { ListPackagesQueryDto } from '../dto/list-packages-query.dto';
import type { PackageListItemDto } from '../dto/package-response.dto';
import { PackagePresenter } from '../presenters/package.presenter';

@Injectable()
export class ListPackagesUseCase {
  constructor(private readonly packages: PackageRepository) {}

  async execute(
    query: ListPackagesQueryDto,
    condominiumId: string,
  ): Promise<PaginatedResult<PackageListItemDto>> {
    const page = await this.packages.findMany({
      condominiumId,
      status: query.status,
      unitNumber: query.unitNumber,
      search: query.search,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });

    return {
      ...page,
      items: page.items.map((parcel) => PackagePresenter.toListItem(parcel)),
    };
  }
}
