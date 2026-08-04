import { Injectable } from '@nestjs/common';

import { AttachmentRepository } from '../../domain/repositories/attachment.repository';
import type { AttachmentResponseDto } from '../dto/attachment-response.dto';
import { AttachmentPresenter } from '../presenters/attachment.presenter';
import { GetPayableUseCase } from './get-payable.use-case';

@Injectable()
export class ListAttachmentsUseCase {
  constructor(
    private readonly attachments: AttachmentRepository,
    private readonly getPayable: GetPayableUseCase,
  ) {}

  async execute(payableId: string, condominiumId: string): Promise<AttachmentResponseDto[]> {
    await this.getPayable.getOrFail(payableId, condominiumId);
    const rows = await this.attachments.listByPayable(payableId);

    return rows.map((attachment) => AttachmentPresenter.toResponse(attachment));
  }
}
