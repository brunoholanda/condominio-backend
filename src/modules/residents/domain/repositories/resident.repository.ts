import type { PageRequest, PaginatedResult } from '../../../../shared/application/paginated-result';
import type { OccupancyType } from '../enums/occupancy-type';
import type { Resident } from '../entities/resident';

export interface ResidentFilters {
  /** Free text matched against name, unit, CPF and e-mail. */
  search?: string;
  unit?: string;
  occupancyType?: OccupancyType;
}

export interface ResidentQuery extends PageRequest, ResidentFilters {}

/** Counters behind the panel of the restricted area. */
export interface ResidentsTally {
  /** Units with a form already submitted (one form per unit), sorted. */
  registeredUnits: string[];
  /** Titulares plus the household members they declared. */
  totalPeople: number;
}

/**
 * Port used by the application layer to reach residents.
 *
 * Declared as an abstract class so it doubles as the Nest injection token,
 * keeping use cases decoupled from TypeORM (Dependency Inversion).
 */
export abstract class ResidentRepository {
  abstract save(resident: Resident): Promise<Resident>;

  abstract findById(id: string): Promise<Resident | null>;

  abstract findMany(query: ResidentQuery): Promise<PaginatedResult<Resident>>;

  /** Every resident matching the filters, without pagination — used by reports. */
  abstract findAll(filters: ResidentFilters): Promise<Resident[]>;

  abstract findIdByCpf(cpf: string): Promise<string | null>;

  abstract findIdByUnit(unit: string): Promise<string | null>;

  abstract tally(): Promise<ResidentsTally>;

  abstract deleteById(id: string): Promise<void>;
}
