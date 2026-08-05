import { Injectable } from '@nestjs/common';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { DocumentType } from '../../domain/enums/document-type';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import type { DocumentResponseDto } from '../dto/document-response.dto';
import type { UpdateDocumentDto } from '../dto/update-document.dto';
import { DocumentPresenter } from '../presenters/document.presenter';
import { GetDocumentUseCase } from './get-document.use-case';

@Injectable()
export class UpdateDocumentUseCase {
  constructor(
    private readonly documents: DocumentRepository,
    private readonly getDocument: GetDocumentUseCase,
  ) {}

  async execute(
    id: string,
    input: UpdateDocumentDto,
    condominiumId: string,
  ): Promise<DocumentResponseDto> {
    const current = await this.getDocument.getOrFail(id, condominiumId);

    if (current.type === DocumentType.DataInventory || input.type === DocumentType.DataInventory) {
      throw new BusinessRuleError(
        'O inventário LGPD só pode ser atualizado pelo sync automático.',
      );
    }

    const snapshot = current.toSnapshot();
    const updated = await this.documents.save(
      current.withData({
        condominiumId,
        type: input.type ?? snapshot.type,
        title: input.title ?? snapshot.title,
        body: input.body ?? snapshot.body,
        isPublic: input.isPublic ?? snapshot.isPublic,
        publishedAt: input.publishedAt ?? snapshot.publishedAt,
        storageKey: snapshot.storageKey,
        createdByUserId: snapshot.createdByUserId,
      }),
    );

    return DocumentPresenter.toResponse(updated);
  }
}
