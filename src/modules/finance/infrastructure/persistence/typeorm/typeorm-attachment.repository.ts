import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { Attachment } from '../../../domain/entities/attachment';
import { AttachmentRepository } from '../../../domain/repositories/attachment.repository';
import { AttachmentOrmEntity } from './entities/attachment.orm-entity';
import { AttachmentMapper } from './attachment.mapper';

@Injectable()
export class TypeormAttachmentRepository extends AttachmentRepository {
  constructor(
    @InjectRepository(AttachmentOrmEntity)
    private readonly repository: Repository<AttachmentOrmEntity>,
  ) {
    super();
  }

  async save(attachment: Attachment): Promise<Attachment> {
    await this.repository.save(AttachmentMapper.toPersistence(attachment));

    const row = await this.repository.findOne({ where: { id: attachment.id } });

    if (!row) {
      throw new Error(`Falha ao persistir o anexo ${attachment.id}.`);
    }

    return AttachmentMapper.toDomain(row);
  }

  async findById(id: string): Promise<Attachment | null> {
    const row = await this.repository.findOne({ where: { id } });

    return row ? AttachmentMapper.toDomain(row) : null;
  }

  async listByPayable(payableId: string): Promise<Attachment[]> {
    const rows = await this.repository.find({ where: { payableId }, order: { createdAt: 'DESC' } });

    return rows.map((row) => AttachmentMapper.toDomain(row));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
