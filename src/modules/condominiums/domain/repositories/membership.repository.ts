import type { Membership } from '../entities/membership';

export abstract class MembershipRepository {
  abstract save(membership: Membership): Promise<Membership>;

  abstract findByUserAndCondo(userId: string, condominiumId: string): Promise<Membership | null>;

  abstract findManyByUser(userId: string): Promise<Membership[]>;

  abstract findManyByCondo(condominiumId: string): Promise<Membership[]>;

  abstract delete(id: string): Promise<void>;
}
