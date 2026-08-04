import { Injectable } from '@nestjs/common';

import { UsefulContactRepository } from '../../domain/repositories/useful-contact.repository';
import type { UsefulContactResponseDto } from '../dto/useful-contact-response.dto';
import { UsefulContactPresenter } from '../presenters/useful-contact.presenter';

@Injectable()
export class ListUsefulContactsUseCase {
  constructor(private readonly contacts: UsefulContactRepository) {}

  async execute(condominiumId: string): Promise<UsefulContactResponseDto[]> {
    const contacts = await this.contacts.findManyByCondo(condominiumId);

    return contacts.map((contact) => UsefulContactPresenter.toResponse(contact));
  }
}
