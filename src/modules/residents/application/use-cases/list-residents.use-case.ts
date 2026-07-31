import { Injectable } from '@nestjs/common';

import { ResidentRepository } from '../../domain/repositories/resident.repository';
import type { ListResidentsQueryDto } from '../dto/list-residents-query.dto';
import type { PaginatedResidentsResponseDto } from '../dto/resident-response.dto';
import { ResidentPresenter } from '../presenters/resident.presenter';

@Injectable()
export class ListResidentsUseCase {
  constructor(private readonly residents: ResidentRepository) {}

  async execute(query: ListResidentsQueryDto): Promise<PaginatedResidentsResponseDto> {
    const result = await this.residents.findMany({
      page: query.page,
      limit: query.limit,
      search: query.search,
      unit: query.unit,
      occupancyType: query.occupancyType,
    });

    return ResidentPresenter.toPaginatedResponse(result);
  }
}
