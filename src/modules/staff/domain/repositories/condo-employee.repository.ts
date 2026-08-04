import type { CondoEmployee } from '../entities/condo-employee';

export abstract class CondoEmployeeRepository {
  abstract save(employee: CondoEmployee): Promise<CondoEmployee>;

  abstract update(employee: CondoEmployee): Promise<CondoEmployee>;

  abstract findById(id: string, condominiumId: string): Promise<CondoEmployee | null>;

  abstract findByCpf(cpf: string, condominiumId: string): Promise<CondoEmployee | null>;

  abstract findIdByCpf(cpf: string, condominiumId: string): Promise<string | null>;

  abstract listByCondominium(condominiumId: string): Promise<CondoEmployee[]>;

  abstract delete(id: string, condominiumId: string): Promise<void>;
}
