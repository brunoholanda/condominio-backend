import type { BookingAuthChallenge } from '../entities/booking-auth-challenge';

export abstract class BookingAuthChallengeRepository {
  abstract save(challenge: BookingAuthChallenge): Promise<BookingAuthChallenge>;

  abstract findById(id: string): Promise<BookingAuthChallenge | null>;

  abstract discardActiveForResident(residentId: string, condominiumId: string): Promise<void>;
}
