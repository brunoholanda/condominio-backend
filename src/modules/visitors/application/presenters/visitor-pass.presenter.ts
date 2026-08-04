import type { VisitorPass } from '../../domain/entities/visitor-pass';
import type { VisitorPassResponseDto } from '../dto/visitor-pass.dto';

export const VisitorPassPresenter = {
  toResponse(pass: VisitorPass): VisitorPassResponseDto {
    const s = pass.toSnapshot();

    return {
      id: s.id,
      condominiumId: s.condominiumId,
      visitorName: s.visitorName,
      visitorDocument: s.visitorDocument,
      hostName: s.hostName,
      unitNumber: s.unitNumber,
      expectedAt: s.expectedAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
      status: s.status,
      notes: s.notes,
      createdByUserId: s.createdByUserId,
      checkedInAt: s.checkedInAt?.toISOString() ?? null,
      checkedInByUserId: s.checkedInByUserId,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    };
  },
};
