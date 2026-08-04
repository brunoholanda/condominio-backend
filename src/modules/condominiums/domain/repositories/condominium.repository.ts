import type { Condominium } from '../entities/condominium';

/**
 * Port used by the application layer to reach condominiums.
 *
 * Declared as an abstract class so it doubles as the Nest injection token,
 * keeping use cases decoupled from TypeORM (Dependency Inversion).
 */
export abstract class CondominiumRepository {
  abstract save(condominium: Condominium): Promise<Condominium>;

  abstract findById(id: string): Promise<Condominium | null>;

  abstract findBySlug(slug: string): Promise<Condominium | null>;

  /** Every condo the user has a membership in, regardless of role. */
  abstract findManyByUserId(userId: string): Promise<Condominium[]>;

  abstract update(condominium: Condominium): Promise<Condominium>;

  abstract delete(id: string): Promise<void>;

  abstract listUnitNumbers(condominiumId: string): Promise<string[]>;

  /** Units currently flagged as empty (no residents living there). */
  abstract listVacantUnitNumbers(condominiumId: string): Promise<string[]>;

  /**
   * Marks or clears the vacant flag on a catalog unit.
   * Returns false when the unit number is not part of the condominium.
   */
  abstract setUnitVacant(
    condominiumId: string,
    unitNumber: string,
    isVacant: boolean,
  ): Promise<boolean>;

  /** Every condominium on the platform (system owner listings). */
  abstract findAll(): Promise<Condominium[]>;

  /** Replaces the whole unit catalog of a condo with the given numbers. */
  abstract replaceUnits(condominiumId: string, numbers: string[]): Promise<void>;
}
