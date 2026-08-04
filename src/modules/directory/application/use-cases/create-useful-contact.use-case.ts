import { Injectable } from '@nestjs/common';

import { UsefulContact } from '../../domain/entities/useful-contact';
import { UsefulContactRepository } from '../../domain/repositories/useful-contact.repository';
import type { CreateUsefulContactDto } from '../dto/create-useful-contact.dto';
import type { UsefulContactResponseDto } from '../dto/useful-contact-response.dto';
import { UsefulContactPresenter } from '../presenters/useful-contact.presenter';

@Injectable()
export class CreateUsefulContactUseCase {
  constructor(private readonly contacts: UsefulContactRepository) {}

  async execute(
    input: CreateUsefulContactDto,
    condominiumId: string,
  ): Promise<UsefulContactResponseDto> {
    const contact = UsefulContact.create({ ...input, condominiumId });
    const saved = await this.contacts.save(contact);

    return UsefulContactPresenter.toResponse(saved);
  }
}
