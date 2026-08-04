import type { VisitorPass } from '../entities/visitor-pass';
import type { VisitorPassStatus } from '../enums/visitor-pass-status';

export interface VisitorPassFilters {
  condominiumId: string;
  status?: VisitorPassStatus;
  from?: Date;
  to?: Date;
}

export abstract class VisitorPassRepository {
  abstract save(pass: VisitorPass): Promise<VisitorPass>;

  abstract findById(id: string, condominiumId: string): Promise<VisitorPass | null>;

  abstract list(filters: VisitorPassFilters): Promise<VisitorPass[]>;
}
