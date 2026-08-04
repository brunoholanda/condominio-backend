import type { PageRequest, PaginatedResult } from '../../../../shared/application/paginated-result';
import type { Charge } from '../entities/charge';
import type { ChargeStatus } from '../enums/charge-status';

export interface ChargeFilters {
  status?: ChargeStatus;
  unitNumber?: string;
  batchId?: string;
  search?: string;
}

export interface ChargeQuery extends PageRequest, ChargeFilters {
  condominiumId: string;
}

export interface ChargeSummary {
  pendingCount: number;
  paidCount: number;
  cancelledCount: number;
  pendingAmountCents: number;
  paidAmountCents: number;
}

export abstract class ChargeRepository {
  abstract save(charge: Charge): Promise<Charge>;

  abstract findById(id: string, condominiumId: string): Promise<Charge | null>;

  abstract findByAsaasPaymentId(asaasPaymentId: string): Promise<Charge | null>;

  abstract findMany(query: ChargeQuery): Promise<PaginatedResult<Charge>>;

  abstract summarize(condominiumId: string): Promise<ChargeSummary>;
}
