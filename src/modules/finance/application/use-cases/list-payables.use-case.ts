import { Injectable } from '@nestjs/common';

import { PayableRepository } from '../../domain/repositories/payable.repository';
import type { PayableFiltersQueryDto } from '../dto/payable-filters-query.dto';
import type { PaginatedPayablesResponseDto } from '../dto/payable-response.dto';
import { PayablePresenter } from '../presenters/payable.presenter';

@Injectable()
export class ListPayablesUseCase {
  constructor(private readonly payables: PayableRepository) {}

  async execute(
    query: PayableFiltersQueryDto,
    condominiumId: string,
  ): Promise<PaginatedPayablesResponseDto> {
    const result = await this.payables.findMany({ ...query, condominiumId });

    return PayablePresenter.toPaginatedResponse(result);
  }
}
