import type { DeepPartial } from 'typeorm';

import { WorkOrder } from '../../../domain/entities/work-order';
import type { WorkOrderOrmEntity } from './entities/work-order.orm-entity';

export const WorkOrderMapper = {
  toDomain(row: WorkOrderOrmEntity): WorkOrder {
    return WorkOrder.restore({
      id: row.id,
      condominiumId: row.condominiumId,
      title: row.title,
      description: row.description,
      category: row.category,
      priority: row.priority,
      status: row.status,
      unitNumber: row.unitNumber,
      reporterName: row.reporterName,
      createdByUserId: row.createdByUserId,
      assignedTo: row.assignedTo,
      resolvedAt: row.resolvedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  },

  toPersistence(order: WorkOrder): DeepPartial<WorkOrderOrmEntity> {
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
      resolvedAt: s.resolvedAt,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
};
