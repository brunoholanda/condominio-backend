import { Injectable } from '@nestjs/common';

import { FileStorage } from '../../../../shared/application/ports/file-storage';
import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { AttachmentRepository } from '../../domain/repositories/attachment.repository';
import { GetPayableUseCase } from './get-payable.use-case';

export interface DownloadedAttachment {
  fileName: string;
  mimeType: string;
  content: Buffer;
}

@Injectable()
export class DownloadAttachmentUseCase {
  constructor(
    private readonly attachments: AttachmentRepository,
    private readonly fileStorage: FileStorage,
    private readonly getPayable: GetPayableUseCase,
  ) {}

  async execute(
    payableId: string,
    attachmentId: string,
    condominiumId: string,
  ): Promise<DownloadedAttachment> {
    await this.getPayable.getOrFail(payableId, condominiumId);
    const attachment = await this.attachments.findById(attachmentId);

    if (!attachment || attachment.toSnapshot().payableId !== payableId) {
      throw new ResourceNotFoundError(`Anexo ${attachmentId} não encontrado.`);
    }

    const snapshot = attachment.toSnapshot();
    const content = await this.fileStorage.read(snapshot.storageKey);

    return { fileName: snapshot.fileName, mimeType: snapshot.mimeType, content };
  }
}
