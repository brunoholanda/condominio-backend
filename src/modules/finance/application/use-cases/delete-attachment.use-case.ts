import { Injectable } from '@nestjs/common';

import { FileStorage } from '../../../../shared/application/ports/file-storage';
import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { AttachmentRepository } from '../../domain/repositories/attachment.repository';
import { GetPayableUseCase } from './get-payable.use-case';

@Injectable()
export class DeleteAttachmentUseCase {
  constructor(
    private readonly attachments: AttachmentRepository,
    private readonly fileStorage: FileStorage,
    private readonly getPayable: GetPayableUseCase,
  ) {}

  async execute(payableId: string, attachmentId: string, condominiumId: string): Promise<void> {
    await this.getPayable.getOrFail(payableId, condominiumId);
    const attachment = await this.attachments.findById(attachmentId);

    if (!attachment || attachment.toSnapshot().payableId !== payableId) {
      throw new ResourceNotFoundError(`Anexo ${attachmentId} não encontrado.`);
    }

    await this.fileStorage.delete(attachment.toSnapshot().storageKey);
    await this.attachments.delete(attachment.id);
  }
}
