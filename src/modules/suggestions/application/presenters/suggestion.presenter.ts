import type { Suggestion } from '../../domain/entities/suggestion';
import type { SuggestionResponseDto } from '../dto/suggestion-response.dto';

export class SuggestionPresenter {
  static toResponse(suggestion: Suggestion): SuggestionResponseDto {
    const snapshot = suggestion.toSnapshot();

    return {
      id: snapshot.id,
      unitNumber: snapshot.unitNumber,
      authorName: snapshot.authorName,
      body: snapshot.body,
      status: snapshot.status,
      createdAt: snapshot.createdAt.toISOString(),
    };
  }
}

/** Masks a full name for the verify step (privacy). */
export function maskAuthorName(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .map((part) => {
      if (part.length <= 1) {
        return part;
      }

      return `${part[0]}${'*'.repeat(Math.min(part.length - 1, 3))}${part.length > 4 ? part.at(-1) : ''}`;
    })
    .join(' ');
}
