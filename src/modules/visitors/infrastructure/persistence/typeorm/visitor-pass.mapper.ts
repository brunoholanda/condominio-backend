import type { DeepPartial } from 'typeorm';

import { VisitorPass } from '../../../domain/entities/visitor-pass';
import type { VisitorPassOrmEntity } from './entities/visitor-pass.orm-entity';

export const VisitorPassMapper = {
  toDomain(row: VisitorPassOrmEntity): VisitorPass {
    return VisitorPass.restore({
      id: row.id,
      condominiumId: row.condominiumId,
      visitorName: row.visitorName,
      visitorDocument: row.visitorDocument,
      hostName: row.hostName,
      unitNumber: row.unitNumber,
      expectedAt: row.expectedAt,
      expiresAt: row.expiresAt,
      status: row.status,
      notes: row.notes,
      createdByUserId: row.createdByUserId,
      checkedInAt: row.checkedInAt,
      checkedInByUserId: row.checkedInByUserId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  },

  toPersistence(pass: VisitorPass): DeepPartial<VisitorPassOrmEntity> {
    const s = pass.toSnapshot();

    return {
      id: s.id,
      condominiumId: s.condominiumId,
      visitorName: s.visitorName,
      visitorDocument: s.visitorDocument,
      hostName: s.hostName,
      unitNumber: s.unitNumber,
      expectedAt: s.expectedAt,
      expiresAt: s.expiresAt,
      status: s.status,
      notes: s.notes,
      createdByUserId: s.createdByUserId,
      checkedInAt: s.checkedInAt,
      checkedInByUserId: s.checkedInByUserId,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    };
  },
};
