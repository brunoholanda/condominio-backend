import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StorageModule } from '../../shared/infrastructure/storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { CondominiumsModule } from '../condominiums/condominiums.module';
import {
  CreateAbsenceUseCase,
  DeleteAbsenceUseCase,
  ListAbsencesUseCase,
  ReviewAbsenceUseCase,
  UpdateAbsenceUseCase,
  UploadAbsenceAttachmentUseCase,
} from './application/use-cases/absence.use-case';
import {
  CreateEmployeeUseCase,
  DeleteEmployeeUseCase,
  GetEmployeeUseCase,
  ListEmployeesUseCase,
  UpdateEmployeeUseCase,
} from './application/use-cases/employee-crud.use-case';
import {
  DownloadPunchSelfieUseCase,
  ExportPunchesCsvUseCase,
  ListPunchesUseCase,
  PurgeOldPunchSelfiesUseCase,
  RegisterPunchUseCase,
} from './application/use-cases/punch.use-case';
import {
  StaffAccessTokenService,
  StaffLoginUseCase,
  StaffMeUseCase,
} from './application/use-cases/staff-auth.use-case';
import { CondoEmployeeRepository } from './domain/repositories/condo-employee.repository';
import { EmployeeAbsenceRepository } from './domain/repositories/employee-absence.repository';
import { TimePunchRepository } from './domain/repositories/time-punch.repository';
import { StaffJwtAuthGuard } from './infrastructure/http/staff-jwt.guard';
import { CondoEmployeeOrmEntity } from './infrastructure/persistence/typeorm/entities/condo-employee.orm-entity';
import { EmployeeAbsenceOrmEntity } from './infrastructure/persistence/typeorm/entities/employee-absence.orm-entity';
import { TimePunchOrmEntity } from './infrastructure/persistence/typeorm/entities/time-punch.orm-entity';
import { TypeormCondoEmployeeRepository } from './infrastructure/persistence/typeorm/typeorm-condo-employee.repository';
import { TypeormEmployeeAbsenceRepository } from './infrastructure/persistence/typeorm/typeorm-employee-absence.repository';
import { TypeormTimePunchRepository } from './infrastructure/persistence/typeorm/typeorm-time-punch.repository';
import {
  StaffLoginLockoutOrmEntity,
  StaffLoginLockoutService,
} from './infrastructure/security/staff-login-lockout.service';
import { AbsencesController } from './presentation/absences.controller';
import {
  EmployeesController,
  PunchesAdminController,
} from './presentation/employees.controller';
import { PublicStaffController } from './presentation/public-staff.controller';

@Module({
  imports: [
    AuthModule,
    CondominiumsModule,
    StorageModule,
    TypeOrmModule.forFeature([
      CondoEmployeeOrmEntity,
      TimePunchOrmEntity,
      EmployeeAbsenceOrmEntity,
      StaffLoginLockoutOrmEntity,
    ]),
  ],
  controllers: [
    EmployeesController,
    PunchesAdminController,
    AbsencesController,
    PublicStaffController,
  ],
  providers: [
    { provide: CondoEmployeeRepository, useClass: TypeormCondoEmployeeRepository },
    { provide: TimePunchRepository, useClass: TypeormTimePunchRepository },
    { provide: EmployeeAbsenceRepository, useClass: TypeormEmployeeAbsenceRepository },
    StaffLoginLockoutService,
    StaffAccessTokenService,
    StaffJwtAuthGuard,
    CreateEmployeeUseCase,
    UpdateEmployeeUseCase,
    ListEmployeesUseCase,
    GetEmployeeUseCase,
    DeleteEmployeeUseCase,
    StaffLoginUseCase,
    StaffMeUseCase,
    RegisterPunchUseCase,
    ListPunchesUseCase,
    DownloadPunchSelfieUseCase,
    ExportPunchesCsvUseCase,
    PurgeOldPunchSelfiesUseCase,
    CreateAbsenceUseCase,
    UpdateAbsenceUseCase,
    ListAbsencesUseCase,
    DeleteAbsenceUseCase,
    ReviewAbsenceUseCase,
    UploadAbsenceAttachmentUseCase,
  ],
})
export class StaffModule {}
