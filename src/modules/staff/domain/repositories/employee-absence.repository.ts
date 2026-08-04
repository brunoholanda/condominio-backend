import type { EmployeeAbsence } from '../entities/employee-absence';

export interface EmployeeAbsenceFilters {
  condominiumId: string;
  employeeId?: string;
  from?: Date;
  to?: Date;
  reason?: string;
  status?: string;
}

export abstract class EmployeeAbsenceRepository {
  abstract save(absence: EmployeeAbsence): Promise<EmployeeAbsence>;

  abstract update(absence: EmployeeAbsence): Promise<EmployeeAbsence>;

  abstract findById(id: string, condominiumId: string): Promise<EmployeeAbsence | null>;

  abstract list(filters: EmployeeAbsenceFilters): Promise<EmployeeAbsence[]>;

  abstract delete(id: string, condominiumId: string): Promise<void>;
}
