import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { CondominiumsModule } from '../condominiums/condominiums.module';
import { ListAllCondominiumsUseCase } from './application/use-cases/list-all-condominiums.use-case';
import { ListPlatformAccountsUseCase } from './application/use-cases/list-platform-accounts.use-case';
import { SetAccountActiveUseCase } from './application/use-cases/set-account-active.use-case';
import { SetPlatformRoleUseCase } from './application/use-cases/set-platform-role.use-case';
import { UpdateAccountSubscriptionUseCase } from './application/use-cases/update-account-subscription.use-case';
import { SystemOwnerGuard } from './infrastructure/http/system-owner.guard';
import { PlatformAdminController } from './presentation/platform-admin.controller';

@Module({
  imports: [AuthModule, CondominiumsModule],
  controllers: [PlatformAdminController],
  providers: [
    SystemOwnerGuard,
    ListPlatformAccountsUseCase,
    SetAccountActiveUseCase,
    SetPlatformRoleUseCase,
    UpdateAccountSubscriptionUseCase,
    ListAllCondominiumsUseCase,
  ],
  exports: [SystemOwnerGuard],
})
export class PlatformAdminModule {}
