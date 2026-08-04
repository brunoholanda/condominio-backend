import type { WorkOrder } from '../../domain/entities/work-order';
import type { WorkOrderResponseDto } from '../dto/work-order.dto';

export const WorkOrderPresenter = {
  toResponse(order: WorkOrder): WorkOrderResponseDto {
    const s = order.toSnapshot();

    return {
      id: s.id,
      condominiumId: s.condominiumId,
      title: s.title,
      description: s.description,
      category: s.category,
      priority: s.priority,
      status: s.status,
      unitNumber: s.unitNumber,
      reporterName: s.reporterName,
      createdByUserId: s.createdByUserId,
      assignedTo: s.assignedTo,
      resolvedAt: s.resolvedAt?.toISOString() ?? null,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    };
  },
};
