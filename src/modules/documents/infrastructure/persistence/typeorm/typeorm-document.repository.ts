import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { Document } from '../../../domain/entities/document';
import { DocumentType } from '../../../domain/enums/document-type';
import { DocumentRepository } from '../../../domain/repositories/document.repository';
import { DocumentOrmEntity } from './entities/document.orm-entity';
import { DocumentMapper } from './document.mapper';

@Injectable()
export class TypeormDocumentRepository extends DocumentRepository {
  constructor(
    @InjectRepository(DocumentOrmEntity)
    private readonly repository: Repository<DocumentOrmEntity>,
  ) {
    super();
  }

  async save(document: Document): Promise<Document> {
    await this.repository.save(DocumentMapper.toPersistence(document));

    const saved = await this.findById(document.id, document.toSnapshot().condominiumId);

    if (!saved) {
      throw new Error(`Falha ao persistir o documento ${document.id}.`);
    }

    return saved;
  }

  async findById(id: string, condominiumId: string): Promise<Document | null> {
    const row = await this.repository.findOne({ where: { id, condominiumId } });

    return row ? DocumentMapper.toDomain(row) : null;
  }

  async findManyByCondo(condominiumId: string, onlyPublic?: boolean): Promise<Document[]> {
    const rows = await this.repository.find({
      where: onlyPublic ? { condominiumId, isPublic: true } : { condominiumId },
      order: { createdAt: 'DESC' },
    });

    return rows.map((row) => DocumentMapper.toDomain(row));
  }

  async findByCondoAndType(
    condominiumId: string,
    type: DocumentType,
  ): Promise<Document | null> {
    const row = await this.repository.findOne({ where: { condominiumId, type } });

    return row ? DocumentMapper.toDomain(row) : null;
  }

  async delete(id: string, condominiumId: string): Promise<void> {
    await this.repository.delete({ id, condominiumId });
  }
}
