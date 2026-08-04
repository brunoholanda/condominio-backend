import { Injectable } from '@nestjs/common';

import {
  BusinessRuleError,
  ResourceNotFoundError,
} from '../../../../shared/domain/domain-error';
import { CondominiumRepository } from '../../../condominiums/domain/repositories/condominium.repository';
import { ResidentRepository } from '../../domain/repositories/resident.repository';
import type { SetUnitVacancyDto } from '../dto/set-unit-vacancy.dto';

/** Flags a catalog unit as empty (or clears the flag) for registration follow-up. */
@Injectable()
export class SetUnitVacancyUseCase {
  constructor(
    private readonly condominiums: CondominiumRepository,
    private readonly residents: ResidentRepository,
  ) {}

  async execute(condominiumId: string, input: SetUnitVacancyDto): Promise<void> {
    const unitNumber = input.unitNumber.trim();

    if (input.vacant) {
      const residentId = await this.residents.findIdByUnit(unitNumber, condominiumId);

      if (residentId) {
        throw new BusinessRuleError(
          `A unidade ${unitNumber} já possui formulário preenchido e não pode ser marcada como desocupada.`,
        );
      }
    }

    const updated = await this.condominiums.setUnitVacant(
      condominiumId,
      unitNumber,
      input.vacant,
    );

    if (!updated) {
      throw new ResourceNotFoundError(
        `A unidade ${unitNumber} não existe neste condomínio.`,
      );
    }
  }
}
