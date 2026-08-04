import { Injectable } from '@nestjs/common';

import { ResourceNotFoundError } from '../../../../shared/domain/domain-error';
import type { UsefulContact } from '../../domain/entities/useful-contact';
import { UsefulContactRepository } from '../../domain/repositories/useful-contact.repository';

@Injectable()
export class GetUsefulContactUseCase {
  constructor(private readonly contacts: UsefulContactRepository) {}

  async getOrFail(id: string, condominiumId: string): Promise<UsefulContact> {
    const contact = await this.contacts.findById(id, condominiumId);

    if (!contact) {
      throw new ResourceNotFoundError(`Contato ${id} não encontrado.`);
    }

    return contact;
  }
}
