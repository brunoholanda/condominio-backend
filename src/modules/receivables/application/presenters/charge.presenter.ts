import { toIsoDate } from '../../../../shared/application/date-format';
import type { PaginatedResult } from '../../../../shared/application/paginated-result';
import type { Charge } from '../../domain/entities/charge';
import { ChargeStatus } from '../../domain/enums/charge-status';
import type {
  ChargeResponseDto,
  PaginatedChargesResponseDto,
} from '../dto/charge-response.dto';

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export class ChargePresenter {
  static toResponse(charge: Charge): ChargeResponseDto {
    const snapshot = charge.toSnapshot();
    const dueDate = toIsoDate(snapshot.dueDate);
    const isOverdue =
      snapshot.status === ChargeStatus.Pending && snapshot.dueDate < startOfTodayUtc();

    return {
      id: snapshot.id,
      condominiumId: snapshot.condominiumId,
      batchId: snapshot.batchId,
      unitNumber: snapshot.unitNumber,
      residentId: snapshot.residentId,
      payerName: snapshot.payerName,
      payerCpf: snapshot.payerCpf,
      description: snapshot.description,
      amountCents: snapshot.amountCents,
      dueDate,
      status: snapshot.status,
      displayStatus: isOverdue ? 'OVERDUE' : snapshot.status,
      asaasPaymentId: snapshot.asaasPaymentId,
      pixPayload: snapshot.pixPayload,
      pixQrCodeBase64: snapshot.pixQrCodeBase64,
      pixExpirationDate: snapshot.pixExpirationDate
        ? snapshot.pixExpirationDate.toISOString()
        : null,
      invoiceUrl: snapshot.invoiceUrl,
      paidAt: snapshot.paidAt ? snapshot.paidAt.toISOString() : null,
      createdAt: snapshot.createdAt.toISOString(),
      updatedAt: snapshot.updatedAt.toISOString(),
    };
  }

  static toPaginatedResponse(result: PaginatedResult<Charge>): PaginatedChargesResponseDto {
    return {
      ...result,
      items: result.items.map((charge) => ChargePresenter.toResponse(charge)),
    };
  }
}
