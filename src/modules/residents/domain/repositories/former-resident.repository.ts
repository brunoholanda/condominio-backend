import type { FormerResidentRecord } from '../entities/former-resident';

export abstract class FormerResidentRepository {
  abstract save(record: FormerResidentRecord): Promise<FormerResidentRecord>;

  abstract findManyByCondo(
    condominiumId: string,
    unit?: string,
  ): Promise<FormerResidentRecord[]>;

  abstract findById(
    id: string,
    condominiumId: string,
  ): Promise<FormerResidentRecord | null>;

  abstract deleteExpired(before: Date): Promise<number>;
}
