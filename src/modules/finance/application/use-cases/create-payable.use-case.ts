import { Injectable } from '@nestjs/common';

import { Payable } from '../../domain/entities/payable';
import { PayableRepository } from '../../domain/repositories/payable.repository';
import type { CreatePayableDto } from '../dto/create-payable.dto';
import type { PayableResponseDto } from '../dto/payable-response.dto';
import { PayablePresenter } from '../presenters/payable.presenter';

@Injectable()
export class CreatePayableUseCase {
  constructor(private readonly payables: PayableRepository) {}

  async execute(
    input: CreatePayableDto,
    condominiumId: string,
    createdByUserId: string,
  ): Promise<PayableResponseDto> {
    const payable = await this.payables.save(
      Payable.create({ ...input, condominiumId, createdByUserId }),
    );

    return PayablePresenter.toResponse(payable);
  }
}
