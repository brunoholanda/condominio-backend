import { Injectable } from '@nestjs/common';

import { toIsoDate } from '../../../../shared/application/date-format';
import type { PageRequest } from '../../../../shared/application/paginated-result';
import type { Payable } from '../../domain/entities/payable';
import { PayableStatus } from '../../domain/enums/payable-status';
import { AttachmentRepository } from '../../domain/repositories/attachment.repository';
import { PayableRepository } from '../../domain/repositories/payable.repository';
import type {
  PaginatedTransparencyPayablesDto,
  TransparencyPayableDto,
} from '../dto/transparency-payable.dto';

@Injectable()
export class ListTransparencyPayablesUseCase {
  constructor(
    private readonly payables: PayableRepository,
    private readonly attachments: AttachmentRepository,
  ) {}

  async execute(
    condominiumId: string,
    pagination: PageRequest,
  ): Promise<PaginatedTransparencyPayablesDto> {
    const result = await this.payables.findMany({
      condominiumId,
      status: PayableStatus.Paid,
      page: pagination.page,
      limit: pagination.limit,
    });

    const items = await Promise.all(
      result.items.map(async (payable) => {
        const attachments = await this.attachments.listByPayable(payable.id);

        return toTransparencyItem(payable, attachments.length);
      }),
    );

    return {
      items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}

function toTransparencyItem(payable: Payable, attachmentCount: number): TransparencyPayableDto {
  const snapshot = payable.toSnapshot();

  return {
    id: snapshot.id,
    description: snapshot.description,
    vendor: snapshot.vendor,
    category: snapshot.category,
    amountCents: snapshot.amountCents,
    dueDate: toIsoDate(snapshot.dueDate),
    paidAt: snapshot.paidAt?.toISOString() ?? null,
    notes: snapshot.notes,
    attachmentCount,
  };
}
