import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import type { Payable } from '../../domain/entities/payable';
import { PayableRepository } from '../../domain/repositories/payable.repository';
import type { PayableResponseDto } from '../dto/payable-response.dto';
import { PayablePresenter } from '../presenters/payable.presenter';

@Injectable()
export class GetPayableUseCase {
  constructor(private readonly payables: PayableRepository) {}

  async execute(id: string, condominiumId: string): Promise<PayableResponseDto> {
    return PayablePresenter.toResponse(await this.getOrFail(id, condominiumId));
  }

  async getOrFail(id: string, condominiumId: string): Promise<Payable> {
    const payable = await this.payables.findById(id, condominiumId);

    if (!payable) {
      throw new ResourceNotFoundError(`Conta a pagar ${id} não encontrada.`);
    }

    return payable;
  }
}
