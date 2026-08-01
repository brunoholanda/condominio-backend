import { Injectable } from '@nestjs/common';

import { ResidentRepository } from '../../domain/repositories/resident.repository';
import { CONDO_UNITS, TOTAL_UNITS } from '../../domain/value-objects/unit';
import type { ResidentsSummaryDto } from '../dto/residents-summary.dto';

/** Compares the registrations received against the fixed catalog of units. */
@Injectable()
export class GetResidentsSummaryUseCase {
  constructor(private readonly residents: ResidentRepository) {}

  async execute(): Promise<ResidentsSummaryDto> {
    const { registeredUnits, totalPeople } = await this.residents.tally();
    const answered = new Set(registeredUnits);
    // O catálogo é a fonte da verdade: pendente é o que existe e não respondeu.
    const pendingUnitNumbers = CONDO_UNITS.filter((unit) => !answered.has(unit));

    return {
      totalUnits: TOTAL_UNITS,
      registeredUnits: registeredUnits.length,
      pendingUnits: pendingUnitNumbers.length,
      pendingUnitNumbers,
      totalPeople,
    };
  }
}
