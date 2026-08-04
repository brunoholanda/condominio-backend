import { Injectable } from '@nestjs/common';

import { CondominiumRepository } from '../../../condominiums/domain/repositories/condominium.repository';
import { ResidentRepository } from '../../domain/repositories/resident.repository';
import type { ResidentsSummaryDto } from '../dto/residents-summary.dto';

/** Compares the registrations received against the condo's unit catalog. */
@Injectable()
export class GetResidentsSummaryUseCase {
  constructor(
    private readonly residents: ResidentRepository,
    private readonly condominiums: CondominiumRepository,
  ) {}

  async execute(condominiumId: string): Promise<ResidentsSummaryDto> {
    const [{ registeredUnits, totalPeople }, allUnits, vacantUnitNumbers] = await Promise.all([
      this.residents.tally(condominiumId),
      this.condominiums.listUnitNumbers(condominiumId),
      this.condominiums.listVacantUnitNumbers(condominiumId),
    ]);
    const answered = new Set(registeredUnits);
    const vacant = new Set(vacantUnitNumbers);
    // Pendente: existe no catálogo, não respondeu e não foi marcada como desocupada.
    const pendingUnitNumbers = allUnits.filter(
      (unit) => !answered.has(unit) && !vacant.has(unit),
    );

    return {
      totalUnits: allUnits.length,
      registeredUnits: registeredUnits.length,
      pendingUnits: pendingUnitNumbers.length,
      pendingUnitNumbers,
      vacantUnits: vacantUnitNumbers.length,
      vacantUnitNumbers,
      totalPeople,
    };
  }
}
