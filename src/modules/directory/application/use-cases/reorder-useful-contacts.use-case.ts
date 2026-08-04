import { Injectable } from '@nestjs/common';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { UsefulContactRepository } from '../../domain/repositories/useful-contact.repository';
import type { UsefulContactResponseDto } from '../dto/useful-contact-response.dto';
import { UsefulContactPresenter } from '../presenters/useful-contact.presenter';

@Injectable()
export class ReorderUsefulContactsUseCase {
  constructor(private readonly contacts: UsefulContactRepository) {}

  async execute(condominiumId: string, orderedIds: string[]): Promise<UsefulContactResponseDto[]> {
    const current = await this.contacts.findManyByCondo(condominiumId);
    const currentIds = new Set(current.map((contact) => contact.id));

    if (orderedIds.length !== current.length || orderedIds.some((id) => !currentIds.has(id))) {
      throw new BusinessRuleError(
        'A lista de reordenação deve conter exatamente os contatos existentes.',
      );
    }

    await this.contacts.reorder(condominiumId, orderedIds);

    const reordered = await this.contacts.findManyByCondo(condominiumId);

    return reordered.map((contact) => UsefulContactPresenter.toResponse(contact));
  }
}
