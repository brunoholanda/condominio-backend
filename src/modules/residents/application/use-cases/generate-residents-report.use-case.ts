import { Injectable } from '@nestjs/common';

import { toIsoDate } from '../../../../shared/application/date-format';
import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { ResidentRepository } from '../../domain/repositories/resident.repository';
import type { ResidentFiltersQueryDto } from '../dto/resident-filters-query.dto';
import { ResidentsReportGenerator } from '../ports/residents-report-generator';
import { ResidentPresenter } from '../presenters/resident.presenter';

export interface ResidentsReport {
  fileName: string;
  content: Buffer;
}

/**
 * Builds a single document with one page per registration matching the filters.
 * The requester travels with it so the file itself says who took it out.
 */
@Injectable()
export class GenerateResidentsReportUseCase {
  constructor(
    private readonly residents: ResidentRepository,
    private readonly reportGenerator: ResidentsReportGenerator,
  ) {}

  async execute(filters: ResidentFiltersQueryDto, requestedBy: string): Promise<ResidentsReport> {
    const residents = await this.residents.findAll(filters);

    if (residents.length === 0) {
      throw new ResourceNotFoundError('Nenhum morador encontrado para gerar o relatório.');
    }

    const content = await this.reportGenerator.generate(
      residents.map((resident) => ResidentPresenter.toResponse(resident)),
      { requestedBy },
    );

    return { fileName: `moradores-${toIsoDate(new Date())}.pdf`, content };
  }
}
