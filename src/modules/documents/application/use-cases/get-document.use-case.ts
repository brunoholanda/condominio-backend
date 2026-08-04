import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import type { Document } from '../../domain/entities/document';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import type { DocumentResponseDto } from '../dto/document-response.dto';
import { DocumentPresenter } from '../presenters/document.presenter';

@Injectable()
export class GetDocumentUseCase {
  constructor(private readonly documents: DocumentRepository) {}

  async execute(id: string, condominiumId: string): Promise<DocumentResponseDto> {
    return DocumentPresenter.toResponse(await this.getOrFail(id, condominiumId));
  }

  async getOrFail(id: string, condominiumId: string): Promise<Document> {
    const document = await this.documents.findById(id, condominiumId);

    if (!document) {
      throw new ResourceNotFoundError(`Documento ${id} não encontrado.`);
    }

    return document;
  }

  async getPublicOrFail(id: string, condominiumId: string): Promise<Document> {
    const document = await this.getOrFail(id, condominiumId);

    if (!document.isPublic) {
      throw new ResourceNotFoundError(`Documento ${id} não encontrado.`);
    }

    return document;
  }
}
