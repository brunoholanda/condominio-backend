import { Injectable } from '@nestjs/common';

import { FileStorage } from '../../../../shared/application/ports/file-storage';
import { StorageKeys } from '../../../../shared/infrastructure/storage/storage-keys';
import { Attachment } from '../../domain/entities/attachment';
import type { AttachmentType } from '../../domain/enums/attachment-type';
import { AttachmentRepository } from '../../domain/repositories/attachment.repository';
import type { AttachmentResponseDto } from '../dto/attachment-response.dto';
import { AttachmentPresenter } from '../presenters/attachment.presenter';
import { GetPayableUseCase } from './get-payable.use-case';

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class AddAttachmentUseCase {
  constructor(
    private readonly attachments: AttachmentRepository,
    private readonly fileStorage: FileStorage,
    private readonly getPayable: GetPayableUseCase,
  ) {}

  async execute(
    payableId: string,
    condominiumId: string,
    type: AttachmentType,
    file: UploadedFile,
    uploadedByUserId: string,
  ): Promise<AttachmentResponseDto> {
    const payable = await this.getPayable.getOrFail(payableId, condominiumId);
    const storageKey = StorageKeys.payableAttachment({
      condominiumId,
      payableId: payable.id,
      type,
      originalName: file.originalname,
    });

    await this.fileStorage.save(file.buffer, storageKey, file.mimetype);

    const attachment = await this.attachments.save(
      Attachment.create({
        payableId: payable.id,
        type,
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storageKey,
        uploadedByUserId,
      }),
    );

    return AttachmentPresenter.toResponse(attachment);
  }
}
