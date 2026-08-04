import { Injectable } from '@nestjs/common';

import { PayableStatusHistory } from '../../domain/entities/payable-status-history';
import { PayableRepository } from '../../domain/repositories/payable.repository';
import { PayableStatusHistoryRepository } from '../../domain/repositories/payable-status-history.repository';
import type { ChangePayableStatusDto } from '../dto/change-payable-status.dto';
import type { PayableResponseDto } from '../dto/payable-response.dto';
import { PayablePresenter } from '../presenters/payable.presenter';
import { GetPayableUseCase } from './get-payable.use-case';

@Injectable()
export class MarkPayableAsPaidUseCase {
  constructor(
    private readonly payables: PayableRepository,
    private readonly statusHistory: PayableStatusHistoryRepository,
    private readonly getPayable: GetPayableUseCase,
  ) {}

  async execute(
    id: string,
    condominiumId: string,
    changedByUserId: string,
    input: ChangePayableStatusDto,
  ): Promise<PayableResponseDto> {
    const current = await this.getPayable.getOrFail(id, condominiumId);
    const fromStatus = current.status;
    const updated = await this.payables.save(current.markAsPaid());

    await this.statusHistory.add(
      PayableStatusHistory.create({
        payableId: updated.id,
        fromStatus,
        toStatus: updated.status,
        changedByUserId,
        note: input.note,
      }),
    );

    return PayablePresenter.toResponse(updated);
  }
}
