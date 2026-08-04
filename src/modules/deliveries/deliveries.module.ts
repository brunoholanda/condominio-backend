import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CondominiumsModule } from '../condominiums/condominiums.module';
import { CompletePublicSigningUseCase } from './application/use-cases/complete-public-signing.use-case';
import { CreatePackageUseCase } from './application/use-cases/create-package.use-case';
import { CreateSigningSessionUseCase } from './application/use-cases/create-signing-session.use-case';
import { DeliverPackageUseCase } from './application/use-cases/deliver-package.use-case';
import { GetPackageUseCase } from './application/use-cases/get-package.use-case';
import { GetPublicSigningSessionUseCase } from './application/use-cases/get-public-signing-session.use-case';
import { ListPackagesUseCase } from './application/use-cases/list-packages.use-case';
import { PackageSigningSessionRepository } from './domain/repositories/package-signing-session.repository';
import { PackageRepository } from './domain/repositories/package.repository';
import { PackageSigningSessionOrmEntity } from './infrastructure/persistence/typeorm/entities/package-signing-session.orm-entity';
import { PackageOrmEntity } from './infrastructure/persistence/typeorm/entities/package.orm-entity';
import { TypeormPackageSigningSessionRepository } from './infrastructure/persistence/typeorm/typeorm-package-signing-session.repository';
import { TypeormPackageRepository } from './infrastructure/persistence/typeorm/typeorm-package.repository';
import { PackagesController } from './presentation/packages.controller';
import { PublicDeliverySignController } from './presentation/public-delivery-sign.controller';

@Module({
  imports: [
    CondominiumsModule,
    TypeOrmModule.forFeature([PackageOrmEntity, PackageSigningSessionOrmEntity]),
  ],
  controllers: [PackagesController, PublicDeliverySignController],
  providers: [
    { provide: PackageRepository, useClass: TypeormPackageRepository },
    { provide: PackageSigningSessionRepository, useClass: TypeormPackageSigningSessionRepository },
    CreatePackageUseCase,
    ListPackagesUseCase,
    GetPackageUseCase,
    DeliverPackageUseCase,
    CreateSigningSessionUseCase,
    GetPublicSigningSessionUseCase,
    CompletePublicSigningUseCase,
  ],
})
export class DeliveriesModule {}
