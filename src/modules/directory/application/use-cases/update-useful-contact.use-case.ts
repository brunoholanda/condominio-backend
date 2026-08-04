import { Injectable } from '@nestjs/common';

import { UsefulContactRepository } from '../../domain/repositories/useful-contact.repository';
import type { UsefulContactResponseDto } from '../dto/useful-contact-response.dto';
import type { UpdateUsefulContactDto } from '../dto/update-useful-contact.dto';
import { UsefulContactPresenter } from '../presenters/useful-contact.presenter';
import { GetUsefulContactUseCase } from './get-useful-contact.use-case';

@Injectable()
export class UpdateUsefulContactUseCase {
  constructor(
    private readonly contacts: UsefulContactRepository,
    private readonly getUsefulContact: GetUsefulContactUseCase,
  ) {}

  async execute(
    id: string,
    input: UpdateUsefulContactDto,
    condominiumId: string,
  ): Promise<UsefulContactResponseDto> {
    const current = await this.getUsefulContact.getOrFail(id, condominiumId);
    const snapshot = current.toSnapshot();
    const updated = await this.contacts.save(
      current.withData({
        condominiumId,
        label: input.label ?? snapshot.label,
        phone: input.phone ?? snapshot.phone,
        url: input.url ?? snapshot.url,
        category: input.category ?? snapshot.category,
        sortOrder: input.sortOrder ?? snapshot.sortOrder,
      }),
    );

    return UsefulContactPresenter.toResponse(updated);
  }
}
