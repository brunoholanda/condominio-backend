import type { UsefulContact } from '../entities/useful-contact';

export abstract class UsefulContactRepository {
  abstract save(contact: UsefulContact): Promise<UsefulContact>;

  abstract findById(id: string, condominiumId: string): Promise<UsefulContact | null>;

  abstract findManyByCondo(condominiumId: string): Promise<UsefulContact[]>;

  abstract delete(id: string, condominiumId: string): Promise<void>;

  abstract reorder(condominiumId: string, orderedIds: string[]): Promise<void>;
}
