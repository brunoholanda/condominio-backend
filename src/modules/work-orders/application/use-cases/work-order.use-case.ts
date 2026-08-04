import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { WorkOrder } from '../../domain/entities/work-order';
import { WorkOrderRepository } from '../../domain/repositories/work-order.repository';
import type {
  CreateWorkOrderDto,
  ListWorkOrdersQueryDto,
  UpdateWorkOrderStatusDto,
  WorkOrderResponseDto,
} from '../dto/work-order.dto';
import { WorkOrderPresenter } from '../presenters/work-order.presenter';

@Injectable()
export class CreateWorkOrderUseCase {
  constructor(private readonly orders: WorkOrderRepository) {}

  async execute(
    condominiumId: string,
    createdByUserId: string,
    input: CreateWorkOrderDto,
  ): Promise<WorkOrderResponseDto> {
    const order = await this.orders.save(
      WorkOrder.create({
        condominiumId,
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        unitNumber: input.unitNumber,
        reporterName: input.reporterName,
        assignedTo: input.assignedTo,
        createdByUserId,
      }),
    );

    return WorkOrderPresenter.toResponse(order);
  }
}

@Injectable()
export class ListWorkOrdersUseCase {
  constructor(private readonly orders: WorkOrderRepository) {}

  async execute(
    condominiumId: string,
    query: ListWorkOrdersQueryDto,
  ): Promise<WorkOrderResponseDto[]> {
    const list = await this.orders.list({
      condominiumId,
      status: query.status,
      category: query.category,
    });

    return list.map((order) => WorkOrderPresenter.toResponse(order));
  }
}

@Injectable()
export class UpdateWorkOrderStatusUseCase {
  constructor(private readonly orders: WorkOrderRepository) {}

  async execute(
    condominiumId: string,
    orderId: string,
    input: UpdateWorkOrderStatusDto,
  ): Promise<WorkOrderResponseDto> {
    const current = await this.orders.findById(orderId, condominiumId);

    if (!current) {
      throw new ResourceNotFoundError('Chamado não encontrado.');
    }

    const updated = await this.orders.save(
      current.withStatus(input.status, input.assignedTo),
    );

    return WorkOrderPresenter.toResponse(updated);
  }
}
