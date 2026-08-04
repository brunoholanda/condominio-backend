import { Injectable } from '@nestjs/common';

import { BusinessRuleError, ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { BookingRepository } from '../../domain/repositories/booking.repository';
import type { BookingResponseDto } from '../dto/booking-response.dto';
import { BookingPresenter } from '../presenters/booking.presenter';
import { GetCommonAreaUseCase } from './get-common-area.use-case';

const MS_PER_HOUR = 3_600_000;

@Injectable()
export class CancelMyBookingUseCase {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly getCommonArea: GetCommonAreaUseCase,
  ) {}

  async execute(
    bookingId: string,
    condominiumId: string,
    residentAccountId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookings.findById(bookingId, condominiumId);

    if (!booking || booking.residentAccountId !== residentAccountId) {
      throw new ResourceNotFoundError(`Reserva ${bookingId} não encontrada.`);
    }

    const area = await this.getCommonArea.getOrFail(
      booking.toSnapshot().commonAreaId,
      condominiumId,
    );
    const cancelBeforeMs = area.cancelBeforeHours * MS_PER_HOUR;

    if (booking.startsAt.getTime() - Date.now() < cancelBeforeMs) {
      throw new BusinessRuleError(
        `Esta área exige o cancelamento com pelo menos ${area.cancelBeforeHours}h de antecedência.`,
      );
    }

    return BookingPresenter.toResponse(await this.bookings.save(booking.cancel()));
  }
}
