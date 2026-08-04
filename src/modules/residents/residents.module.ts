import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CondominiumsModule } from '../condominiums/condominiums.module';
import { CreateResidentUseCase } from './application/use-cases/create-resident.use-case';
import { DeleteResidentUseCase } from './application/use-cases/delete-resident.use-case';
import { FindResidentByIdUseCase } from './application/use-cases/find-resident-by-id.use-case';
import { GenerateResidentsReportUseCase } from './application/use-cases/generate-residents-report.use-case';
import { GetResidentsSummaryUseCase } from './application/use-cases/get-residents-summary.use-case';
import { ListResidentsUseCase } from './application/use-cases/list-residents.use-case';
import { SetUnitVacancyUseCase } from './application/use-cases/set-unit-vacancy.use-case';
import { UpdateResidentUseCase } from './application/use-cases/update-resident.use-case';
import { ResidentsReportGenerator } from './application/ports/residents-report-generator';
import { ResidentRepository } from './domain/repositories/resident.repository';
import { HouseholdMemberOrmEntity } from './infrastructure/persistence/typeorm/entities/household-member.orm-entity';
import { PetOrmEntity } from './infrastructure/persistence/typeorm/entities/pet.orm-entity';
import { ResidentOrmEntity } from './infrastructure/persistence/typeorm/entities/resident.orm-entity';
import { UnitEmployeeOrmEntity } from './infrastructure/persistence/typeorm/entities/unit-employee.orm-entity';
import { VehicleOrmEntity } from './infrastructure/persistence/typeorm/entities/vehicle.orm-entity';
import { TypeormResidentRepository } from './infrastructure/persistence/typeorm/typeorm-resident.repository';
import { PdfKitResidentsReportGenerator } from './infrastructure/reports/pdfkit-residents-report.generator';
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
    ]),
  ],
  controllers: [ResidentsController, PublicCondoResidentsController],
  providers: [
    // The application layer depends on the port; the adapter is chosen here.
    { provide: ResidentRepository, useClass: TypeormResidentRepository },
    { provide: ResidentsReportGenerator, useClass: PdfKitResidentsReportGenerator },
    CreateResidentUseCase,
    ListResidentsUseCase,
    GetResidentsSummaryUseCase,
    GenerateResidentsReportUseCase,
    FindResidentByIdUseCase,
    UpdateResidentUseCase,
    DeleteResidentUseCase,
    SetUnitVacancyUseCase,
  ],
  exports: [ResidentRepository],
})
export class ResidentsModule {}
