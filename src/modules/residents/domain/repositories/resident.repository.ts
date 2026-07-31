import type { PageRequest, PaginatedResult } from '../../../../shared/application/paginated-result';
import type { OccupancyType } from '../enums/occupancy-type';
import type { Resident } from '../entities/resident';

export interface ResidentQuery extends PageRequest {
  /** Free text matched against name, unit, CPF and e-mail. */
  search?: string;
  unit?: string;
  occupancyType?: OccupancyType;
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

  abstract findIdByCpf(cpf: string): Promise<string | null>;

  abstract deleteById(id: string): Promise<void>;
}
