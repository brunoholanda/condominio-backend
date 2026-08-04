import { Injectable } from '@nestjs/common';

import type { SuggestionStatus } from '../../domain/enums/suggestion-status';
import { SuggestionRepository } from '../../domain/repositories/suggestion.repository';
import type { SuggestionResponseDto } from '../dto/suggestion-response.dto';
import { SuggestionPresenter } from '../presenters/suggestion.presenter';

@Injectable()
export class ListSuggestionsUseCase {
  constructor(private readonly suggestions: SuggestionRepository) {}

  async execute(
    condominiumId: string,
    status?: SuggestionStatus,
  ): Promise<SuggestionResponseDto[]> {
    const rows = await this.suggestions.findManyByCondo(condominiumId, status);

    return rows.map((suggestion) => SuggestionPresenter.toResponse(suggestion));
  }
}
