import { Injectable } from '@nestjs/common';

import { toIsoDate } from '../../../../shared/application/date-format';
import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { PayableStatus } from '../../domain/enums/payable-status';
import { AttachmentRepository } from '../../domain/repositories/attachment.repository';
import { PayableRepository } from '../../domain/repositories/payable.repository';
import type { TransparencyPayableDetailDto } from '../dto/transparency-payable.dto';

@Injectable()
export class GetTransparencyPayableUseCase {
  constructor(
    private readonly payables: PayableRepository,
    private readonly attachments: AttachmentRepository,
  ) {}

  async execute(id: string, condominiumId: string): Promise<TransparencyPayableDetailDto> {
    const payable = await this.payables.findById(id, condominiumId);

    if (!payable || payable.status !== PayableStatus.Paid) {
      throw new ResourceNotFoundError('Conta paga não encontrada no portal da transparência.');
    }

    const snapshot = payable.toSnapshot();
    const attachments = await this.attachments.listByPayable(payable.id);

    return {
      id: snapshot.id,
      description: snapshot.description,
      vendor: snapshot.vendor,
      category: snapshot.category,
      amountCents: snapshot.amountCents,
      dueDate: toIsoDate(snapshot.dueDate),
      paidAt: snapshot.paidAt?.toISOString() ?? null,
      notes: snapshot.notes,
      attachmentCount: attachments.length,
      attachments: attachments.map((attachment) => {
        const row = attachment.toSnapshot();

        return {
          id: row.id,
          type: row.type,
          fileName: row.fileName,
          mimeType: row.mimeType,
          sizeBytes: row.sizeBytes,
        };
      }),
    };
  }
}
