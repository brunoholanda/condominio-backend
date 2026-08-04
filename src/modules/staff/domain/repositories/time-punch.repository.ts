import type { TimePunch } from '../entities/time-punch';

export interface TimePunchFilters {
  condominiumId: string;
  employeeId?: string;
  from?: Date;
  to?: Date;
  status?: string;
}

export abstract class TimePunchRepository {
  abstract save(punch: TimePunch): Promise<TimePunch>;

  abstract findById(id: string, condominiumId: string): Promise<TimePunch | null>;

  abstract list(filters: TimePunchFilters): Promise<TimePunch[]>;

  abstract findLastAcceptedOfDay(
    employeeId: string,
    dayStart: Date,
    dayEnd: Date,
  ): Promise<TimePunch | null>;

  abstract listSelfiesForPurge(
    condominiumId: string,
    olderThan: Date,
  ): Promise<TimePunch[]>;
}
