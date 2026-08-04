import { Injectable } from '@nestjs/common';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { Cpf } from '../../../../shared/domain/value-objects/cpf';
import { ResidentRepository } from '../../../residents/domain/repositories/resident.repository';
import type {
  VerifySuggestionIdentityDto,
  VerifySuggestionIdentityResponseDto,
} from '../dto/verify-suggestion-identity.dto';
import { maskAuthorName } from '../presenters/suggestion.presenter';

@Injectable()
export class VerifySuggestionIdentityUseCase {
  constructor(private readonly residents: ResidentRepository) {}

  async execute(
    condominiumId: string,
    input: VerifySuggestionIdentityDto,
  ): Promise<VerifySuggestionIdentityResponseDto> {
    const cpf = Cpf.create(input.cpf);
    const unitNumber = input.unitNumber.trim();
    const resident = await this.residents.findByUnitAndCpf(unitNumber, cpf.value, condominiumId);

    if (!resident) {
      throw new BusinessRuleError(
        'Unidade e CPF não conferem com um cadastro deste condomínio.',
      );
    }

    return {
      valid: true,
      unitNumber: resident.unit.value,
      authorNameHint: maskAuthorName(resident.fullName),
    };
  }
}
