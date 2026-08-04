import type { ResidentAccount } from '../entities/resident-account';

export abstract class ResidentAccountRepository {
  abstract save(account: ResidentAccount): Promise<ResidentAccount>;

  abstract findByUserAndCondo(
    userId: string,
    condominiumId: string,
  ): Promise<ResidentAccount | null>;

  abstract findById(id: string): Promise<ResidentAccount | null>;

  abstract findManyByCondo(condominiumId: string): Promise<ResidentAccount[]>;

  abstract delete(id: string): Promise<void>;
}
