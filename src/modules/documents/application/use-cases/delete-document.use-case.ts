import { Injectable } from '@nestjs/common';

import { DocumentRepository } from '../../domain/repositories/document.repository';
import { GetDocumentUseCase } from './get-document.use-case';

@Injectable()
export class DeleteDocumentUseCase {
  constructor(
    private readonly documents: DocumentRepository,
    private readonly getDocument: GetDocumentUseCase,
  ) {}

  async execute(id: string, condominiumId: string): Promise<void> {
    await this.getDocument.getOrFail(id, condominiumId);
    await this.documents.delete(id, condominiumId);
  }
}
