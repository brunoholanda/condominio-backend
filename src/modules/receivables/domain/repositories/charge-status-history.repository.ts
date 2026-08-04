import type { ChargeStatusHistory } from '../entities/charge-status-history';

export abstract class ChargeStatusHistoryRepository {
  abstract save(entry: ChargeStatusHistory): Promise<ChargeStatusHistory>;
}
