import { randomUUID } from 'node:crypto';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { optionalText, requireEnum, requireText } from '../../../../shared/domain/guards';
import {
  WorkOrderCategory,
  WorkOrderPriority,
  WorkOrderStatus,
} from '../enums/work-order.enums';

export interface WorkOrderProps {
  condominiumId: string;
  title: string;
  description: string;
  category: WorkOrderCategory | string;
  priority?: WorkOrderPriority | string;
  unitNumber?: string | null;
  reporterName?: string | null;
  createdByUserId?: string | null;
  assignedTo?: string | null;
}

export interface WorkOrderSnapshot {
  id: string;
  condominiumId: string;
  title: string;
  description: string;
  category: WorkOrderCategory;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  unitNumber: string | null;
  reporterName: string | null;
  createdByUserId: string | null;
  assignedTo: string | null;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkOrder {
  private constructor(private readonly state: WorkOrderSnapshot) {}

  static create(props: WorkOrderProps): WorkOrder {
    const now = new Date();

    return new WorkOrder({
      id: randomUUID(),
      condominiumId: requireText('condomínio', props.condominiumId, { min: 36, max: 36 }),
      title: requireText('título', props.title, { min: 3, max: 200 }),
      description: requireText('descrição', props.description, { min: 5, max: 5000 }),
      category: requireEnum('categoria', props.category, WorkOrderCategory),
      priority: requireEnum(
        'prioridade',
        props.priority ?? WorkOrderPriority.Normal,
        WorkOrderPriority,
      ),
      status: WorkOrderStatus.Open,
      unitNumber: optionalText('unidade', props.unitNumber ?? null, { max: 40 }),
      reporterName: optionalText('solicitante', props.reporterName ?? null, { max: 150 }),
      createdByUserId: optionalText('criador', props.createdByUserId ?? null, {
        min: 36,
        max: 36,
      }),
      assignedTo: optionalText('responsável', props.assignedTo ?? null, { max: 150 }),
      resolvedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(snapshot: WorkOrderSnapshot): WorkOrder {
    return new WorkOrder({
      ...snapshot,
      category: requireEnum('categoria', snapshot.category, WorkOrderCategory),
      priority: requireEnum('prioridade', snapshot.priority, WorkOrderPriority),
      status: requireEnum('status', snapshot.status, WorkOrderStatus),
    });
  }

  withStatus(status: WorkOrderStatus | string, assignedTo?: string | null): WorkOrder {
    const next = requireEnum('status', status, WorkOrderStatus);

    if (
      this.state.status === WorkOrderStatus.Cancelled ||
      this.state.status === WorkOrderStatus.Resolved
    ) {
      throw new BusinessRuleError(
        `Chamado ${this.state.status} não pode mudar de status.`,
      );
    }

    const now = new Date();

    return new WorkOrder({
      ...this.state,
      status: next,
      assignedTo:
        assignedTo !== undefined
          ? optionalText('responsável', assignedTo, { max: 150 })
          : this.state.assignedTo,
      resolvedAt: next === WorkOrderStatus.Resolved ? now : this.state.resolvedAt,
      updatedAt: now,
    });
  }

  get id(): string {
    return this.state.id;
  }

  get condominiumId(): string {
    return this.state.condominiumId;
  }

  get status(): WorkOrderStatus {
    return this.state.status;
  }

  toSnapshot(): WorkOrderSnapshot {
    return { ...this.state };
  }
}
