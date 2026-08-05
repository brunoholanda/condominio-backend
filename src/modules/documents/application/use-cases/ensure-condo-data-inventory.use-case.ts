import { Injectable } from '@nestjs/common';

import { GetCondominiumUseCase } from '../../../condominiums/application/use-cases/get-condominium.use-case';
import {
  buildCondoDataInventoryBody,
  CONDO_DATA_INVENTORY_TITLE,
  DATA_INVENTORY_VERSION,
} from '../../../privacy/application/data-inventory.content';
import { Document } from '../../domain/entities/document';
import { DocumentType } from '../../domain/enums/document-type';
import { DocumentRepository } from '../../domain/repositories/document.repository';
import type { DocumentResponseDto } from '../dto/document-response.dto';
import { DocumentPresenter } from '../presenters/document.presenter';

@Injectable()
export class EnsureCondoDataInventoryUseCase {
  constructor(
    private readonly documents: DocumentRepository,
    private readonly getCondo: GetCondominiumUseCase,
  ) {}

  async execute(condominiumId: string, actorUserId: string): Promise<DocumentResponseDto> {
    const condo = await this.getCondo.execute(condominiumId);
    const body = buildCondoDataInventoryBody(condo.name);
    const title = `${CONDO_DATA_INVENTORY_TITLE} · ${DATA_INVENTORY_VERSION}`.slice(0, 200);

    const existing = await this.documents.findByCondoAndType(
      condominiumId,
      DocumentType.DataInventory,
    );

    if (existing) {
      const updated = await this.documents.save(
        existing.withData({
          condominiumId,
          type: DocumentType.DataInventory,
          title,
          body,
          isPublic: false,
          publishedAt: null,
          createdByUserId: existing.toSnapshot().createdByUserId,
        }),
      );

      return DocumentPresenter.toResponse(updated);
    }

    const created = await this.documents.save(
      Document.create({
        condominiumId,
        type: DocumentType.DataInventory,
        title,
        body,
        isPublic: false,
        publishedAt: null,
        createdByUserId: actorUserId,
      }),
    );

    return DocumentPresenter.toResponse(created);
  }
}
