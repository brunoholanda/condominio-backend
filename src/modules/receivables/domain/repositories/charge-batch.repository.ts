import type { ChargeBatch } from '../entities/charge-batch';

export abstract class ChargeBatchRepository {
  abstract save(batch: ChargeBatch): Promise<ChargeBatch>;

  abstract findById(id: string, condominiumId: string): Promise<ChargeBatch | null>;
}
