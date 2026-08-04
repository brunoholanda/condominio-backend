import type { PageRequest, PaginatedResult } from '../../../../shared/application/paginated-result';
import type { Package } from '../entities/package';
import type { PackageStatus } from '../enums/package-status';

export interface PackageFilters {
  status?: PackageStatus;
  unitNumber?: string;
  search?: string;
}

export interface PackageQuery extends PageRequest, PackageFilters {
  condominiumId: string;
}

export abstract class PackageRepository {
  abstract save(parcel: Package): Promise<Package>;

  /**
   * `condominiumId` is omitted only by public, token-authorized flows (remote
   * signing) that do not know it in advance; every other caller must scope
   * the lookup to the condo the caller belongs to.
   */
  abstract findById(id: string, condominiumId?: string): Promise<Package | null>;

  abstract findMany(query: PackageQuery): Promise<PaginatedResult<Package>>;
}
