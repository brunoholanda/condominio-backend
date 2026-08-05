import { Module } from '@nestjs/common';

import { CondominiumsModule } from '../condominiums/condominiums.module';
import { GetPlatformDataInventoryUseCase } from './application/use-cases/get-platform-data-inventory.use-case';
import { PrivacyController } from './presentation/privacy.controller';

@Module({
  imports: [CondominiumsModule],
  controllers: [PrivacyController],
  providers: [GetPlatformDataInventoryUseCase],
})
export class PrivacyModule {}
