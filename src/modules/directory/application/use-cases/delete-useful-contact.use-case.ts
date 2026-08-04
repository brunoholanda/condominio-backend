import { Injectable } from '@nestjs/common';

import { UsefulContactRepository } from '../../domain/repositories/useful-contact.repository';
import { GetUsefulContactUseCase } from './get-useful-contact.use-case';

@Injectable()
export class DeleteUsefulContactUseCase {
  constructor(
    private readonly contacts: UsefulContactRepository,
    private readonly getUsefulContact: GetUsefulContactUseCase,
  ) {}

  async execute(id: string, condominiumId: string): Promise<void> {
    await this.getUsefulContact.getOrFail(id, condominiumId);
    await this.contacts.delete(id, condominiumId);
  }
}
