import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, IsNull, MoreThan } from 'typeorm';

import type { PackageSigningSession } from '../../../domain/entities/package-signing-session';
import { PackageSigningSessionRepository } from '../../../domain/repositories/package-signing-session.repository';
import { PackageSigningSessionOrmEntity } from './entities/package-signing-session.orm-entity';
import { PackageSigningSessionMapper } from './package-signing-session.mapper';

@Injectable()
export class TypeormPackageSigningSessionRepository extends PackageSigningSessionRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
  }

  async save(session: PackageSigningSession): Promise<PackageSigningSession> {
    const row = PackageSigningSessionMapper.toPersistence(session);

    await this.dataSource.getRepository(PackageSigningSessionOrmEntity).save(row);

    const saved = await this.dataSource.getRepository(PackageSigningSessionOrmEntity).findOne({
      where: { id: session.id },
    });

    if (!saved) {
      throw new Error(`Falha ao persistir a sessão de assinatura ${session.id}.`);
    }

    return PackageSigningSessionMapper.toDomain(saved);
  }

  async findByToken(token: string): Promise<PackageSigningSession | null> {
    const row = await this.dataSource
      .getRepository(PackageSigningSessionOrmEntity)
      .findOne({ where: { token } });

    return row ? PackageSigningSessionMapper.toDomain(row) : null;
  }

  async findValidByPackageId(packageId: string): Promise<PackageSigningSession | null> {
    const row = await this.dataSource.getRepository(PackageSigningSessionOrmEntity).findOne({
      where: { packageId, consumedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      order: { createdAt: 'DESC' },
    });

    return row ? PackageSigningSessionMapper.toDomain(row) : null;
  }
}
