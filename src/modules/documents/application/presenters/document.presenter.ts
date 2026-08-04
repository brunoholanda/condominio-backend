import type { Document } from '../../domain/entities/document';
import type { DocumentResponseDto } from '../dto/document-response.dto';

export class DocumentPresenter {
  static toResponse(document: Document): DocumentResponseDto {
    const snapshot = document.toSnapshot();

    return {
      id: snapshot.id,
      condominiumId: snapshot.condominiumId,
      type: snapshot.type,
      title: snapshot.title,
      body: snapshot.body,
      storageKey: snapshot.storageKey,
      isPublic: snapshot.isPublic,
      publishedAt: snapshot.publishedAt,
      createdByUserId: snapshot.createdByUserId,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    };
  }
}
