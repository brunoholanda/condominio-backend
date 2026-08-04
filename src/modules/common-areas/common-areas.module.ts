import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { CondominiumsModule } from '../condominiums/condominiums.module';
import { ApproveBookingUseCase } from './application/use-cases/approve-booking.use-case';
import { CancelMyBookingUseCase } from './application/use-cases/cancel-my-booking.use-case';
import { CreateBookingUseCase } from './application/use-cases/create-booking.use-case';
import { CreateCommonAreaUseCase } from './application/use-cases/create-common-area.use-case';
import { CreateResidentAccountUseCase } from './application/use-cases/create-resident-account.use-case';
import { DeleteCommonAreaUseCase } from './application/use-cases/delete-common-area.use-case';
import { GetCommonAreaUseCase } from './application/use-cases/get-common-area.use-case';
import { ListBookingsUseCase } from './application/use-cases/list-bookings.use-case';
import { ListCommonAreasUseCase } from './application/use-cases/list-common-areas.use-case';
import { ListMyBookingsUseCase } from './application/use-cases/list-my-bookings.use-case';
import { ListResidentAccountsUseCase } from './application/use-cases/list-resident-accounts.use-case';
import { RejectBookingUseCase } from './application/use-cases/reject-booking.use-case';
import { UpdateCommonAreaUseCase } from './application/use-cases/update-common-area.use-case';
import { BookingRepository } from './domain/repositories/booking.repository';
import { CommonAreaRepository } from './domain/repositories/common-area.repository';
import { ResidentAccountRepository } from './domain/repositories/resident-account.repository';
import { BookingOrmEntity } from './infrastructure/persistence/typeorm/entities/booking.orm-entity';
import { CommonAreaOrmEntity } from './infrastructure/persistence/typeorm/entities/common-area.orm-entity';
import { ResidentAccountOrmEntity } from './infrastructure/persistence/typeorm/entities/resident-account.orm-entity';
import { TypeormBookingRepository } from './infrastructure/persistence/typeorm/typeorm-booking.repository';
import { TypeormCommonAreaRepository } from './infrastructure/persistence/typeorm/typeorm-common-area.repository';
import { TypeormResidentAccountRepository } from './infrastructure/persistence/typeorm/typeorm-resident-account.repository';
import { ResidentAccountAccessGuard } from './infrastructure/http/resident-account-access.guard';
import { BookingsManagerController } from './presentation/bookings-manager.controller';
import { CommonAreasController } from './presentation/common-areas.controller';
import { PublicCommonAreasController } from './presentation/public-common-areas.controller';
import { ResidentAccountsController } from './presentation/resident-accounts.controller';
import { ResidentBookingsController } from './presentation/resident-bookings.controller';

@Module({
  imports: [
    CondominiumsModule,
    AuthModule,
    TypeOrmModule.forFeature([ResidentAccountOrmEntity, CommonAreaOrmEntity, BookingOrmEntity]),
  ],
  controllers: [
    CommonAreasController,
    BookingsManagerController,
    ResidentAccountsController,
    PublicCommonAreasController,
    ResidentBookingsController,
  ],
  providers: [
    { provide: ResidentAccountRepository, useClass: TypeormResidentAccountRepository },
    { provide: CommonAreaRepository, useClass: TypeormCommonAreaRepository },
    { provide: BookingRepository, useClass: TypeormBookingRepository },
    ResidentAccountAccessGuard,
    CreateCommonAreaUseCase,
    ListCommonAreasUseCase,
    GetCommonAreaUseCase,
    UpdateCommonAreaUseCase,
    DeleteCommonAreaUseCase,
    CreateResidentAccountUseCase,
    ListResidentAccountsUseCase,
    CreateBookingUseCase,
    ListMyBookingsUseCase,
    CancelMyBookingUseCase,
    ListBookingsUseCase,
    ApproveBookingUseCase,
    RejectBookingUseCase,
  ],
})
export class CommonAreasModule {}
