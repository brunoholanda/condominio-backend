import { Injectable } from '@nestjs/common';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { DocumentType } from '../../domain/enums/document-type';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import { GetDocumentUseCase } from './get-document.use-case';

@Injectable()
export class DeleteDocumentUseCase {
  constructor(
    private readonly documents: DocumentRepository,
    private readonly getDocument: GetDocumentUseCase,
  ) {}

  async execute(id: string, condominiumId: string): Promise<void> {
    const document = await this.getDocument.getOrFail(id, condominiumId);

    if (document.type === DocumentType.DataInventory) {
      throw new BusinessRuleError(
        'O inventário LGPD não pode ser removido. Use o sync para atualizar o conteúdo.',
      );
    }

    await this.documents.delete(id, condominiumId);
  }
}
