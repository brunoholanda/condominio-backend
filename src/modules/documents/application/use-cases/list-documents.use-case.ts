import { Injectable } from '@nestjs/common';

import { DocumentRepository } from '../../domain/repositories/document.repository';
import type { DocumentResponseDto } from '../dto/document-response.dto';
import { DocumentPresenter } from '../presenters/document.presenter';

@Injectable()
export class ListDocumentsUseCase {
  constructor(private readonly documents: DocumentRepository) {}

  async execute(condominiumId: string, onlyPublic?: boolean): Promise<DocumentResponseDto[]> {
    const documents = await this.documents.findManyByCondo(condominiumId, onlyPublic);

    return documents.map((document) => DocumentPresenter.toResponse(document));
  }
}
