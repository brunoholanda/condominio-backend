import type { Suggestion } from '../entities/suggestion';
import type { SuggestionStatus } from '../enums/suggestion-status';

export abstract class SuggestionRepository {
  abstract save(suggestion: Suggestion): Promise<Suggestion>;

  abstract findById(id: string, condominiumId: string): Promise<Suggestion | null>;

  abstract findManyByCondo(
    condominiumId: string,
    status?: SuggestionStatus,
  ): Promise<Suggestion[]>;
}
