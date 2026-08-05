import type { Booking } from '../entities/booking';
import type { BookingStatus } from '../enums/booking-status';

export interface BookingFilters {
  commonAreaId?: string;
  status?: BookingStatus;
}

export abstract class BookingRepository {
  abstract save(booking: Booking): Promise<Booking>;

  abstract findById(id: string, condominiumId: string): Promise<Booking | null>;

  abstract findManyByCondo(condominiumId: string, filters?: BookingFilters): Promise<Booking[]>;

  abstract findManyByResident(residentId: string): Promise<Booking[]>;

  /** Bookings of the area overlapping the window, in one of the given statuses. */
  abstract findOverlapping(
    commonAreaId: string,
    startsAt: Date,
    endsAt: Date,
    statuses: BookingStatus[],
    excludeBookingId?: string,
  ): Promise<Booking[]>;
}
