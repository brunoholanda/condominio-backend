import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import { BookingRepository } from '../../domain/repositories/booking.repository';
import type { BookingResponseDto } from '../dto/booking-response.dto';
import { BookingPresenter } from '../presenters/booking.presenter';

@Injectable()
export class ApproveBookingUseCase {
  constructor(private readonly bookings: BookingRepository) {}

  async execute(bookingId: string, condominiumId: string): Promise<BookingResponseDto> {
    const booking = await this.bookings.findById(bookingId, condominiumId);

    if (!booking) {
      throw new ResourceNotFoundError(`Reserva ${bookingId} não encontrada.`);
    }

    return BookingPresenter.toResponse(await this.bookings.save(booking.approve()));
  }
}
