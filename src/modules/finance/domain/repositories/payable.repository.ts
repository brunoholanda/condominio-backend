import type { PageRequest, PaginatedResult } from '../../../../shared/application/paginated-result';
import type { Payable } from '../entities/payable';
import type { PayableStatus } from '../enums/payable-status';

export interface PayableFilters {
  status?: PayableStatus;
  category?: string;
  search?: string;
}

export interface PayableQuery extends PageRequest, PayableFilters {
  condominiumId: string;
}

export abstract class PayableRepository {
  abstract save(payable: Payable): Promise<Payable>;

  abstract findById(id: string, condominiumId: string): Promise<Payable | null>;

  abstract findMany(query: PayableQuery): Promise<PaginatedResult<Payable>>;
}
