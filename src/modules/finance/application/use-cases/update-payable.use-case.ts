import { Injectable } from '@nestjs/common';

import { PayableRepository } from '../../domain/repositories/payable.repository';
import type { PayableResponseDto } from '../dto/payable-response.dto';
import type { UpdatePayableDto } from '../dto/update-payable.dto';
import { PayablePresenter } from '../presenters/payable.presenter';
import { GetPayableUseCase } from './get-payable.use-case';

@Injectable()
export class UpdatePayableUseCase {
  constructor(
    private readonly payables: PayableRepository,
    private readonly getPayable: GetPayableUseCase,
  ) {}

  async execute(
    id: string,
    input: UpdatePayableDto,
    condominiumId: string,
  ): Promise<PayableResponseDto> {
    const current = await this.getPayable.getOrFail(id, condominiumId);
    const updated = await this.payables.save(
      current.withData({ ...input, condominiumId, createdByUserId: current.createdByUserId }),
    );

    return PayablePresenter.toResponse(updated);
  }
}
