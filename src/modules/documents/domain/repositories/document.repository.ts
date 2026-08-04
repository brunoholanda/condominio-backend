import type { Document } from '../entities/document';

export abstract class DocumentRepository {
  abstract save(document: Document): Promise<Document>;

  abstract findById(id: string, condominiumId: string): Promise<Document | null>;

  abstract findManyByCondo(condominiumId: string, onlyPublic?: boolean): Promise<Document[]>;

  abstract delete(id: string, condominiumId: string): Promise<void>;
}
