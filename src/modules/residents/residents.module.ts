import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CondominiumsModule } from '../condominiums/condominiums.module';
import { ArchiveFormerResidentUseCase } from './application/use-cases/archive-former-resident.use-case';
import { CreateResidentUseCase } from './application/use-cases/create-resident.use-case';
import { DeleteResidentUseCase } from './application/use-cases/delete-resident.use-case';
import { FindResidentByIdUseCase } from './application/use-cases/find-resident-by-id.use-case';
import {
  FindFormerResidentByIdUseCase,
  ListFormerResidentsUseCase,
  PurgeExpiredFormerResidentsUseCase,
} from './application/use-cases/former-resident-queries.use-case';
import { GenerateResidentsReportUseCase } from './application/use-cases/generate-residents-report.use-case';
import { GetResidentsSummaryUseCase } from './application/use-cases/get-residents-summary.use-case';
import { ListResidentsUseCase } from './application/use-cases/list-residents.use-case';
import { SetUnitVacancyUseCase } from './application/use-cases/set-unit-vacancy.use-case';
import { UpdateResidentUseCase } from './application/use-cases/update-resident.use-case';
import { ResidentsReportGenerator } from './application/ports/residents-report-generator';
import { FormerResidentRepository } from './domain/repositories/former-resident.repository';
import { ResidentRepository } from './domain/repositories/resident.repository';
import { FormerResidentsPurgeScheduler } from './infrastructure/former-residents-purge.scheduler';
import { FormerResidentOrmEntity } from './infrastructure/persistence/typeorm/entities/former-resident.orm-entity';
import { HouseholdMemberOrmEntity } from './infrastructure/persistence/typeorm/entities/household-member.orm-entity';
import { PetOrmEntity } from './infrastructure/persistence/typeorm/entities/pet.orm-entity';
import { ResidentOrmEntity } from './infrastructure/persistence/typeorm/entities/resident.orm-entity';
import { UnitEmployeeOrmEntity } from './infrastructure/persistence/typeorm/entities/unit-employee.orm-entity';
import { VehicleOrmEntity } from './infrastructure/persistence/typeorm/entities/vehicle.orm-entity';
import { TypeormFormerResidentRepository } from './infrastructure/persistence/typeorm/typeorm-former-resident.repository';
import { TypeormResidentRepository } from './infrastructure/persistence/typeorm/typeorm-resident.repository';
import { PdfKitResidentsReportGenerator } from './infrastructure/reports/pdfkit-residents-report.generator';
import { FormerResidentsController } from './presentation/former-residents.controller';
import { PublicCondoResidentsController } from './presentation/public-condo-residents.controller';
import { ResidentsController } from './presentation/residents.controller';

@Module({
  imports: [
    CondominiumsModule,
    TypeOrmModule.forFeature([
      ResidentOrmEntity,
      HouseholdMemberOrmEntity,
      UnitEmployeeOrmEntity,
      VehicleOrmEntity,
      PetOrmEntity,
      FormerResidentOrmEntity,
    ]),
  ],
  controllers: [ResidentsController, PublicCondoResidentsController, FormerResidentsController],
  providers: [
    { provide: ResidentRepository, useClass: TypeormResidentRepository },
    { provide: FormerResidentRepository, useClass: TypeormFormerResidentRepository },
    { provide: ResidentsReportGenerator, useClass: PdfKitResidentsReportGenerator },
    CreateResidentUseCase,
    ListResidentsUseCase,
    GetResidentsSummaryUseCase,
    GenerateResidentsReportUseCase,
    FindResidentByIdUseCase,
    UpdateResidentUseCase,
    DeleteResidentUseCase,
    SetUnitVacancyUseCase,
    ArchiveFormerResidentUseCase,
    ListFormerResidentsUseCase,
    FindFormerResidentByIdUseCase,
    PurgeExpiredFormerResidentsUseCase,
    FormerResidentsPurgeScheduler,
  ],
  exports: [ResidentRepository],
})
export class ResidentsModule {}
