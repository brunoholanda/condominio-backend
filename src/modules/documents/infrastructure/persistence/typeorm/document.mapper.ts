import type { DeepPartial } from 'typeorm';

import type { DocumentSnapshot } from '../../../domain/entities/document';
import { Document } from '../../../domain/entities/document';
import type { DocumentOrmEntity } from './entities/document.orm-entity';

export class DocumentMapper {
  static toDomain(row: DocumentOrmEntity): Document {
    const snapshot: DocumentSnapshot = {
      id: row.id,
      condominiumId: row.condominiumId,
      type: row.type,
      title: row.title,
      body: row.body,
      storageKey: row.storageKey,
      publishedAt: row.publishedAt,
      isPublic: row.isPublic,
      createdByUserId: row.createdByUserId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    return Document.restore(snapshot);
  }

  static toPersistence(document: Document): DeepPartial<DocumentOrmEntity> {
    const snapshot = document.toSnapshot();

    return {
      id: snapshot.id,
      condominiumId: snapshot.condominiumId,
      type: snapshot.type,
      title: snapshot.title,
      body: snapshot.body,
      storageKey: snapshot.storageKey,
      publishedAt: snapshot.publishedAt,
      isPublic: snapshot.isPublic,
      createdByUserId: snapshot.createdByUserId,
    };
  }
}
