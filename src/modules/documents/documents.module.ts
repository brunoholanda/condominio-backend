import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CondominiumsModule } from '../condominiums/condominiums.module';
import { CreateDocumentUseCase } from './application/use-cases/create-document.use-case';
import { DeleteDocumentUseCase } from './application/use-cases/delete-document.use-case';
import { GetDocumentUseCase } from './application/use-cases/get-document.use-case';
import { ListDocumentsUseCase } from './application/use-cases/list-documents.use-case';
import { UpdateDocumentUseCase } from './application/use-cases/update-document.use-case';
import { DocumentRepository } from './domain/repositories/document.repository';
import { DocumentOrmEntity } from './infrastructure/persistence/typeorm/entities/document.orm-entity';
import { TypeormDocumentRepository } from './infrastructure/persistence/typeorm/typeorm-document.repository';
import { DocumentsController } from './presentation/documents.controller';
import { PublicDocumentsController } from './presentation/public-documents.controller';

@Module({
  imports: [CondominiumsModule, TypeOrmModule.forFeature([DocumentOrmEntity])],
  controllers: [DocumentsController, PublicDocumentsController],
  providers: [
    { provide: DocumentRepository, useClass: TypeormDocumentRepository },
    CreateDocumentUseCase,
    ListDocumentsUseCase,
    GetDocumentUseCase,
    UpdateDocumentUseCase,
    DeleteDocumentUseCase,
  ],
})
export class DocumentsModule {}
