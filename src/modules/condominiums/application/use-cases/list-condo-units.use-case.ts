import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { CondominiumRepository } from '../../domain/repositories/condominium.repository';

/** Serves the unit catalog either by internal id (authenticated) or by public slug. */
@Injectable()
export class ListCondoUnitsUseCase {
  constructor(private readonly condominiums: CondominiumRepository) {}

  async byId(condominiumId: string): Promise<string[]> {
    return this.condominiums.listUnitNumbers(condominiumId);
  }

  async bySlug(slug: string): Promise<string[]> {
    const condominium = await this.condominiums.findBySlug(slug);

    if (!condominium) {
      throw new ResourceNotFoundError(`Condomínio "${slug}" não encontrado.`);
    }

    return this.condominiums.listUnitNumbers(condominium.id);
  }
}
