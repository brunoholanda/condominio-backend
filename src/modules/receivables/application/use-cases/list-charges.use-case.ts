import { Injectable, NotFoundException } from '@nestjs/common';

import { ChargeStatus } from '../../domain/enums/charge-status';
import { ChargeRepository } from '../../domain/repositories/charge.repository';
import type {
  ChargeResponseDto,
  ChargeSummaryResponseDto,
  PaginatedChargesResponseDto,
} from '../dto/charge-response.dto';
import type { ChargeFiltersQueryDto } from '../dto/receivables.dto';
import { ChargePresenter } from '../presenters/charge.presenter';

@Injectable()
export class ListChargesUseCase {
  constructor(private readonly charges: ChargeRepository) {}

  async execute(
    condominiumId: string,
    query: ChargeFiltersQueryDto,
  ): Promise<PaginatedChargesResponseDto> {
    const status =
      query.status && Object.values(ChargeStatus).includes(query.status as ChargeStatus)
        ? (query.status as ChargeStatus)
        : undefined;

    const result = await this.charges.findMany({
      condominiumId,
      status,
      unitNumber: query.unitNumber,
      batchId: query.batchId,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return ChargePresenter.toPaginatedResponse(result);
  }
}

@Injectable()
export class GetChargeUseCase {
  constructor(private readonly charges: ChargeRepository) {}

  async execute(id: string, condominiumId: string): Promise<ChargeResponseDto> {
    const charge = await this.charges.findById(id, condominiumId);

    if (!charge) {
      throw new NotFoundException('Cobrança não encontrada.');
    }

    return ChargePresenter.toResponse(charge);
  }
}

@Injectable()
export class SummarizeChargesUseCase {
  constructor(private readonly charges: ChargeRepository) {}

  async execute(condominiumId: string): Promise<ChargeSummaryResponseDto> {
    return this.charges.summarize(condominiumId);
  }
}
