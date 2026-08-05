import { Injectable } from '@nestjs/common';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { Document } from '../../domain/entities/document';
import { DocumentType } from '../../domain/enums/document-type';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import type { CreateDocumentDto } from '../dto/create-document.dto';
import type { DocumentResponseDto } from '../dto/document-response.dto';
import { DocumentPresenter } from '../presenters/document.presenter';

@Injectable()
export class CreateDocumentUseCase {
  constructor(private readonly documents: DocumentRepository) {}

  async execute(
    input: CreateDocumentDto,
    condominiumId: string,
    createdByUserId: string,
  ): Promise<DocumentResponseDto> {
    if (input.type === DocumentType.DataInventory) {
      throw new BusinessRuleError(
        'O inventário LGPD é gerado pelo botão “Atualizar inventário”, não pela publicação manual.',
      );
    }

    const document = Document.create({ ...input, condominiumId, createdByUserId });
    const saved = await this.documents.save(document);

    return DocumentPresenter.toResponse(saved);
  }
}
