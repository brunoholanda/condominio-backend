import { Injectable } from '@nestjs/common';

import { UserRepository } from '../../../auth/domain/repositories/user.repository';
import type { PlatformAccountDto } from '../dto/platform-account.dto';
import { PlatformAccountPresenter } from '../presenters/platform-account.presenter';

@Injectable()
export class ListPlatformAccountsUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(): Promise<PlatformAccountDto[]> {
    const users = await this.users.findAll();

    return users.map((user) => PlatformAccountPresenter.toResponse(user));
  }
}
