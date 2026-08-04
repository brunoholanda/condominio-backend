import type { UsefulContact } from '../../domain/entities/useful-contact';
import type { UsefulContactResponseDto } from '../dto/useful-contact-response.dto';

export class UsefulContactPresenter {
  static toResponse(contact: UsefulContact): UsefulContactResponseDto {
    const snapshot = contact.toSnapshot();

    return {
      id: snapshot.id,
      condominiumId: snapshot.condominiumId,
      label: snapshot.label,
      phone: snapshot.phone,
      url: snapshot.url,
      category: snapshot.category,
      sortOrder: snapshot.sortOrder,
      createdAt: snapshot.createdAt,
    };
  }
}
