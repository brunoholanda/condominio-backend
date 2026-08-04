import { Injectable } from '@nestjs/common';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { Cpf } from '../../../../shared/domain/value-objects/cpf';
import { ResidentRepository } from '../../../residents/domain/repositories/resident.repository';
import { Suggestion } from '../../domain/entities/suggestion';
import { SuggestionRepository } from '../../domain/repositories/suggestion.repository';
import type { CreateSuggestionDto } from '../dto/create-suggestion.dto';
import type { SuggestionResponseDto } from '../dto/suggestion-response.dto';
import { SuggestionPresenter } from '../presenters/suggestion.presenter';

@Injectable()
export class CreateSuggestionUseCase {
  constructor(
    private readonly suggestions: SuggestionRepository,
    private readonly residents: ResidentRepository,
  ) {}

  async execute(
    condominiumId: string,
    input: CreateSuggestionDto,
  ): Promise<SuggestionResponseDto> {
    if (input.respectAndTransparencyCommitment !== true) {
      throw new BusinessRuleError(
        'É necessário confirmar o compromisso com o respeito e a transparência.',
      );
    }

    const cpf = Cpf.create(input.cpf);
    const unitNumber = input.unitNumber.trim();
    const resident = await this.residents.findByUnitAndCpf(unitNumber, cpf.value, condominiumId);

    if (!resident) {
      throw new BusinessRuleError(
        'Unidade e CPF não conferem com um cadastro deste condomínio.',
      );
    }

    const suggestion = await this.suggestions.save(
      Suggestion.create({
        condominiumId,
        unitNumber: resident.unit.value,
        residentId: resident.id,
        authorName: resident.fullName,
        body: input.body,
      }),
    );

    return SuggestionPresenter.toResponse(suggestion);
  }
}
