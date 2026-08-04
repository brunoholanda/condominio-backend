import { Injectable } from '@nestjs/common';

import { ResidentAccountRepository } from '../../domain/repositories/resident-account.repository';
import type { ResidentAccountResponseDto } from '../dto/resident-account-response.dto';
import { ResidentAccountPresenter } from '../presenters/resident-account.presenter';

@Injectable()
export class ListResidentAccountsUseCase {
  constructor(private readonly residentAccounts: ResidentAccountRepository) {}

  async execute(condominiumId: string): Promise<ResidentAccountResponseDto[]> {
    const rows = await this.residentAccounts.findManyByCondo(condominiumId);

    return rows.map((account) => ResidentAccountPresenter.toResponse(account));
  }
}
