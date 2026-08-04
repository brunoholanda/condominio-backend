import { Injectable } from '@nestjs/common';

import { BookingRepository } from '../../domain/repositories/booking.repository';
import type { BookingResponseDto } from '../dto/booking-response.dto';
import { BookingPresenter } from '../presenters/booking.presenter';

@Injectable()
export class ListMyBookingsUseCase {
  constructor(private readonly bookings: BookingRepository) {}

  async execute(residentAccountId: string): Promise<BookingResponseDto[]> {
    const rows = await this.bookings.findManyByResidentAccount(residentAccountId);

    return rows.map((booking) => BookingPresenter.toResponse(booking));
  }
}
