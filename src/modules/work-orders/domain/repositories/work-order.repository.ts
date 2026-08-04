import type { WorkOrder } from '../entities/work-order';
import type { WorkOrderCategory, WorkOrderStatus } from '../enums/work-order.enums';

export interface WorkOrderFilters {
  condominiumId: string;
  status?: WorkOrderStatus;
  category?: WorkOrderCategory;
}

export abstract class WorkOrderRepository {
  abstract save(order: WorkOrder): Promise<WorkOrder>;

  abstract findById(id: string, condominiumId: string): Promise<WorkOrder | null>;

  abstract list(filters: WorkOrderFilters): Promise<WorkOrder[]>;
}
