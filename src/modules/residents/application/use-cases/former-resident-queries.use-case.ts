import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { FormerResidentRepository } from '../../domain/repositories/former-resident.repository';
import type {
  FormerResidentDetailDto,
  FormerResidentListItemDto,
} from '../dto/former-resident-response.dto';
import { FormerResidentPresenter } from '../presenters/former-resident.presenter';

@Injectable()
export class ListFormerResidentsUseCase {
  constructor(private readonly formerResidents: FormerResidentRepository) {}

  async execute(
    condominiumId: string,
    unit?: string,
  ): Promise<FormerResidentListItemDto[]> {
    const rows = await this.formerResidents.findManyByCondo(condominiumId, unit);

    return rows.map((row) => FormerResidentPresenter.toListItem(row));
  }
}

@Injectable()
export class FindFormerResidentByIdUseCase {
  constructor(private readonly formerResidents: FormerResidentRepository) {}

  async execute(
    id: string,
    condominiumId: string,
  ): Promise<FormerResidentDetailDto> {
    const record = await this.formerResidents.findById(id, condominiumId);

    if (!record) {
      throw new ResourceNotFoundError('Registro histórico de morador não encontrado.');
    }

    return FormerResidentPresenter.toDetail(record);
  }
}

@Injectable()
export class PurgeExpiredFormerResidentsUseCase {
  constructor(private readonly formerResidents: FormerResidentRepository) {}

  async execute(): Promise<{ deleted: number }> {
    const deleted = await this.formerResidents.deleteExpired(new Date());

    return { deleted };
  }
}
