import type { Document } from '../entities/document';
import type { DocumentType } from '../enums/document-type';

export abstract class DocumentRepository {
  abstract save(document: Document): Promise<Document>;

  abstract findById(id: string, condominiumId: string): Promise<Document | null>;

  abstract findManyByCondo(condominiumId: string, onlyPublic?: boolean): Promise<Document[]>;

  abstract findByCondoAndType(
    condominiumId: string,
    type: DocumentType,
  ): Promise<Document | null>;

  abstract delete(id: string, condominiumId: string): Promise<void>;
}
