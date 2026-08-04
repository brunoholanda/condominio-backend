import type { Booking } from '../../domain/entities/booking';
import type { BookingResponseDto } from '../dto/booking-response.dto';

export class BookingPresenter {
  static toResponse(booking: Booking): BookingResponseDto {
    const snapshot = booking.toSnapshot();

    return {
      ...snapshot,
      startsAt: snapshot.startsAt.toISOString(),
      endsAt: snapshot.endsAt.toISOString(),
      rulesAcceptedAt: snapshot.rulesAcceptedAt.toISOString(),
      createdAt: snapshot.createdAt.toISOString(),
      updatedAt: snapshot.updatedAt.toISOString(),
    };
  }
}
