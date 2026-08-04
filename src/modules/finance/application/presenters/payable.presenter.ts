import type { PaginatedResult } from '../../../../shared/application/paginated-result';
import { toIsoDate } from '../../../../shared/application/date-format';
import type { Payable } from '../../domain/entities/payable';
import type { PaginatedPayablesResponseDto, PayableResponseDto } from '../dto/payable-response.dto';

export class PayablePresenter {
  static toResponse(payable: Payable): PayableResponseDto {
    const snapshot = payable.toSnapshot();

    return {
      ...snapshot,
      dueDate: toIsoDate(snapshot.dueDate),
      paidAt: snapshot.paidAt ? snapshot.paidAt.toISOString() : null,
      createdAt: snapshot.createdAt.toISOString(),
      updatedAt: snapshot.updatedAt.toISOString(),
    };
  }

  static toPaginatedResponse(result: PaginatedResult<Payable>): PaginatedPayablesResponseDto {
    return {
      ...result,
      items: result.items.map((payable) => PayablePresenter.toResponse(payable)),
    };
  }
}
