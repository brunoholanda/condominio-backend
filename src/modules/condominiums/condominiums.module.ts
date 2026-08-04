import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { AddMembershipUseCase } from './application/use-cases/add-membership.use-case';
import { CreateCondominiumUseCase } from './application/use-cases/create-condominium.use-case';
import { GetCondominiumBySlugUseCase } from './application/use-cases/get-condominium-by-slug.use-case';
import { GetCondominiumUseCase } from './application/use-cases/get-condominium.use-case';
import { ListCondoUnitsUseCase } from './application/use-cases/list-condo-units.use-case';
import { ListMembershipsUseCase } from './application/use-cases/list-memberships.use-case';
import { ListMyCondominiumsUseCase } from './application/use-cases/list-my-condominiums.use-case';
import { GeneratePublicQrPdfUseCase } from './application/use-cases/generate-public-qr-pdf.use-case';
import { NominatimClient } from './application/services/nominatim.client';
import { GeocodeAddressUseCase } from './application/use-cases/geocode-address.use-case';
import { LookupCepUseCase } from './application/use-cases/lookup-cep.use-case';
import { RemoveMembershipUseCase } from './application/use-cases/remove-membership.use-case';
import { SuggestAddressesUseCase } from './application/use-cases/suggest-addresses.use-case';
import { UpdateCondominiumUseCase } from './application/use-cases/update-condominium.use-case';
import { UpdateMembershipRoleUseCase } from './application/use-cases/update-membership-role.use-case';
import { CondominiumRepository } from './domain/repositories/condominium.repository';
import { MembershipRepository } from './domain/repositories/membership.repository';
import { CondoUnitOrmEntity } from './infrastructure/persistence/typeorm/entities/condo-unit.orm-entity';
import { CondominiumOrmEntity } from './infrastructure/persistence/typeorm/entities/condominium.orm-entity';
import { MembershipOrmEntity } from './infrastructure/persistence/typeorm/entities/membership.orm-entity';
import { TypeormCondominiumRepository } from './infrastructure/persistence/typeorm/typeorm-condominium.repository';
import { TypeormMembershipRepository } from './infrastructure/persistence/typeorm/typeorm-membership.repository';
import { PdfKitPublicQrGenerator } from './infrastructure/reports/pdfkit-public-qr.generator';
import { CondominiumAccessGuard } from './infrastructure/http/condominium-access.guard';
import { CondominiumsController } from './presentation/condominiums.controller';
import { GeocodeController } from './presentation/geocode.controller';
import { MembershipsController } from './presentation/memberships.controller';
import { PublicCondominiumsController } from './presentation/public-condominiums.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([CondominiumOrmEntity, CondoUnitOrmEntity, MembershipOrmEntity]),
  ],
  controllers: [
    CondominiumsController,
    PublicCondominiumsController,
    MembershipsController,
    GeocodeController,
  ],
  providers: [
    { provide: CondominiumRepository, useClass: TypeormCondominiumRepository },
    { provide: MembershipRepository, useClass: TypeormMembershipRepository },
    CondominiumAccessGuard,
    CreateCondominiumUseCase,
    ListMyCondominiumsUseCase,
    GetCondominiumUseCase,
    GetCondominiumBySlugUseCase,
    UpdateCondominiumUseCase,
    ListCondoUnitsUseCase,
    GeneratePublicQrPdfUseCase,
    PdfKitPublicQrGenerator,
    NominatimClient,
    GeocodeAddressUseCase,
    SuggestAddressesUseCase,
    LookupCepUseCase,
    ListMembershipsUseCase,
    AddMembershipUseCase,
    UpdateMembershipRoleUseCase,
    RemoveMembershipUseCase,
  ],
  exports: [
    CondominiumRepository,
    MembershipRepository,
    CondominiumAccessGuard,
    GetCondominiumUseCase,
    GetCondominiumBySlugUseCase,
    ListCondoUnitsUseCase,
  ],
})
export class CondominiumsModule {}
