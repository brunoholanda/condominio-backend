import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { SuggestionRepository } from '../../domain/repositories/suggestion.repository';
import type { SuggestionResponseDto } from '../dto/suggestion-response.dto';
import { SuggestionPresenter } from '../presenters/suggestion.presenter';

@Injectable()
export class MarkSuggestionAsReadUseCase {
  constructor(private readonly suggestions: SuggestionRepository) {}

  async execute(id: string, condominiumId: string): Promise<SuggestionResponseDto> {
    const suggestion = await this.suggestions.findById(id, condominiumId);

    if (!suggestion) {
      throw new ResourceNotFoundError('Sugestão não encontrada.');
    }

    const updated = await this.suggestions.save(suggestion.markAsRead());

    return SuggestionPresenter.toResponse(updated);
  }
}
