import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreateResidentUseCase } from './application/use-cases/create-resident.use-case';
import { DeleteResidentUseCase } from './application/use-cases/delete-resident.use-case';
import { FindResidentByIdUseCase } from './application/use-cases/find-resident-by-id.use-case';
import { ListResidentsUseCase } from './application/use-cases/list-residents.use-case';
import { UpdateResidentUseCase } from './application/use-cases/update-resident.use-case';
import { ResidentRepository } from './domain/repositories/resident.repository';
import { HouseholdMemberOrmEntity } from './infrastructure/persistence/typeorm/entities/household-member.orm-entity';
import { PetOrmEntity } from './infrastructure/persistence/typeorm/entities/pet.orm-entity';
import { ResidentOrmEntity } from './infrastructure/persistence/typeorm/entities/resident.orm-entity';
import { UnitEmployeeOrmEntity } from './infrastructure/persistence/typeorm/entities/unit-employee.orm-entity';
import { VehicleOrmEntity } from './infrastructure/persistence/typeorm/entities/vehicle.orm-entity';
import { TypeormResidentRepository } from './infrastructure/persistence/typeorm/typeorm-resident.repository';
import { ResidentsController } from './presentation/residents.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResidentOrmEntity,
      HouseholdMemberOrmEntity,
      UnitEmployeeOrmEntity,
      VehicleOrmEntity,
      PetOrmEntity,
    ]),
  ],
  controllers: [ResidentsController],
  providers: [
    // The application layer depends on the port; the adapter is chosen here.
    { provide: ResidentRepository, useClass: TypeormResidentRepository },
    CreateResidentUseCase,
    ListResidentsUseCase,
    FindResidentByIdUseCase,
    UpdateResidentUseCase,
    DeleteResidentUseCase,
  ],
})
export class ResidentsModule {}
