import type { DeepPartial } from 'typeorm';

import { toIsoDate } from '../../../../../shared/application/date-format';
import { EmployeeAbsence } from '../../../domain/entities/employee-absence';
import { AbsenceStatus, type AbsenceReason } from '../../../domain/enums/staff.enums';
import type { EmployeeAbsenceOrmEntity } from './entities/employee-absence.orm-entity';

export class EmployeeAbsenceMapper {
  static toDomain(row: EmployeeAbsenceOrmEntity): EmployeeAbsence {
    return EmployeeAbsence.restore({
      id: row.id,
      condominiumId: row.condominiumId,
      employeeId: row.employeeId,
      reason: row.reason as AbsenceReason,
      startDate: new Date(row.startDate),
      endDate: new Date(row.endDate),
      notes: row.notes,
      status: (row.status as AbsenceStatus) || AbsenceStatus.Pending,
      attachmentStorageKey: row.attachmentStorageKey,
      reviewedByUserId: row.reviewedByUserId,
      reviewedAt: row.reviewedAt,
      reviewNotes: row.reviewNotes,
      createdByUserId: row.createdByUserId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(absence: EmployeeAbsence): DeepPartial<EmployeeAbsenceOrmEntity> {
    const s = absence.toSnapshot();

    return {
      id: s.id,
      condominiumId: s.condominiumId,
      employeeId: s.employeeId,
      reason: s.reason,
      startDate: toIsoDate(s.startDate),
      endDate: toIsoDate(s.endDate),
      notes: s.notes,
      status: s.status,
      attachmentStorageKey: s.attachmentStorageKey,
      reviewedByUserId: s.reviewedByUserId,
      reviewedAt: s.reviewedAt,
      reviewNotes: s.reviewNotes,
      createdByUserId: s.createdByUserId,
    };
  }
}
