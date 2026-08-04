import { Injectable } from '@nestjs/common';

import { FileStorage } from '../../../../shared/application/ports/file-storage';
import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { PayableStatus } from '../../domain/enums/payable-status';
import { AttachmentRepository } from '../../domain/repositories/attachment.repository';
import { PayableRepository } from '../../domain/repositories/payable.repository';
import type { DownloadedAttachment } from './download-attachment.use-case';

/** Downloads an attachment only when the payable is already paid (transparency portal). */
@Injectable()
export class DownloadTransparencyAttachmentUseCase {
  constructor(
    private readonly payables: PayableRepository,
    private readonly attachments: AttachmentRepository,
    private readonly fileStorage: FileStorage,
  ) {}

  async execute(
    payableId: string,
    attachmentId: string,
    condominiumId: string,
  ): Promise<DownloadedAttachment> {
    const payable = await this.payables.findById(payableId, condominiumId);

    if (!payable || payable.status !== PayableStatus.Paid) {
      throw new ResourceNotFoundError('Conta paga não encontrada no portal da transparência.');
    }

    const attachment = await this.attachments.findById(attachmentId);

    if (!attachment || attachment.toSnapshot().payableId !== payableId) {
      throw new ResourceNotFoundError('Anexo não encontrado.');
    }

    const snapshot = attachment.toSnapshot();
    const content = await this.fileStorage.read(snapshot.storageKey);

    return { fileName: snapshot.fileName, mimeType: snapshot.mimeType, content };
  }
}
