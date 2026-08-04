export enum BookingStatus {
  Requested = 'REQUESTED',
  Approved = 'APPROVED',
  Rejected = 'REJECTED',
  Cancelled = 'CANCELLED',
}

/** Bookings in these statuses actually hold the time slot. */
export const ACTIVE_BOOKING_STATUSES = [BookingStatus.Requested, BookingStatus.Approved] as const;
