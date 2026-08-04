import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CondominiumsModule } from '../condominiums/condominiums.module';
import { CreateUsefulContactUseCase } from './application/use-cases/create-useful-contact.use-case';
import { DeleteUsefulContactUseCase } from './application/use-cases/delete-useful-contact.use-case';
import { GetUsefulContactUseCase } from './application/use-cases/get-useful-contact.use-case';
import { ListUsefulContactsUseCase } from './application/use-cases/list-useful-contacts.use-case';
import { ReorderUsefulContactsUseCase } from './application/use-cases/reorder-useful-contacts.use-case';
import { UpdateUsefulContactUseCase } from './application/use-cases/update-useful-contact.use-case';
import { UsefulContactRepository } from './domain/repositories/useful-contact.repository';
import { UsefulContactOrmEntity } from './infrastructure/persistence/typeorm/entities/useful-contact.orm-entity';
import { TypeormUsefulContactRepository } from './infrastructure/persistence/typeorm/typeorm-useful-contact.repository';
import { PublicUsefulContactsController } from './presentation/public-useful-contacts.controller';
import { UsefulContactsController } from './presentation/useful-contacts.controller';

@Module({
  imports: [CondominiumsModule, TypeOrmModule.forFeature([UsefulContactOrmEntity])],
  controllers: [UsefulContactsController, PublicUsefulContactsController],
  providers: [
    { provide: UsefulContactRepository, useClass: TypeormUsefulContactRepository },
    CreateUsefulContactUseCase,
    ListUsefulContactsUseCase,
    GetUsefulContactUseCase,
    UpdateUsefulContactUseCase,
    DeleteUsefulContactUseCase,
    ReorderUsefulContactsUseCase,
  ],
  exports: [UsefulContactRepository],
})
export class DirectoryModule {}
