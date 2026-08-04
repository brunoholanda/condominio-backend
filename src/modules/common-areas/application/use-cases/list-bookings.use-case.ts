import { Injectable } from '@nestjs/common';

import type { BookingFilters } from '../../domain/repositories/booking.repository';
import { BookingRepository } from '../../domain/repositories/booking.repository';
import type { BookingResponseDto } from '../dto/booking-response.dto';
import { BookingPresenter } from '../presenters/booking.presenter';

@Injectable()
export class ListBookingsUseCase {
  constructor(private readonly bookings: BookingRepository) {}

  async execute(condominiumId: string, filters: BookingFilters): Promise<BookingResponseDto[]> {
    const rows = await this.bookings.findManyByCondo(condominiumId, filters);

    return rows.map((booking) => BookingPresenter.toResponse(booking));
  }
}
