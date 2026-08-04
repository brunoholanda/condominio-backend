import type { PayableStatusHistory } from '../entities/payable-status-history';

export abstract class PayableStatusHistoryRepository {
  abstract add(entry: PayableStatusHistory): Promise<PayableStatusHistory>;

  abstract listByPayable(payableId: string): Promise<PayableStatusHistory[]>;
}
