import { Injectable } from '@nestjs/common';

import { toIsoDate } from '../../../../shared/application/date-format';
import { FileStorage } from '../../../../shared/application/ports/file-storage';
import {
  InvalidFieldError,
  ResourceNotFoundError,
} from '../../../../shared/domain/domain-error';
import { StorageKeys } from '../../../../shared/infrastructure/storage/storage-keys';
import { GetCondominiumUseCase } from '../../../condominiums/application/use-cases/get-condominium.use-case';
import { EmployeeAbsence } from '../../domain/entities/employee-absence';
import { ABSENCE_REASON_LABELS, AbsenceStatus } from '../../domain/enums/staff.enums';
import { CondoEmployeeRepository } from '../../domain/repositories/condo-employee.repository';
import { EmployeeAbsenceRepository } from '../../domain/repositories/employee-absence.repository';
import type {
  AbsenceResponseDto,
  CreateAbsenceDto,
  ListAbsencesQueryDto,
  ReviewAbsenceDto,
  UpdateAbsenceDto,
} from '../dto/absence.dto';

@Injectable()
export class CreateAbsenceUseCase {
  constructor(
    private readonly absences: EmployeeAbsenceRepository,
    private readonly employees: CondoEmployeeRepository,
    private readonly getCondominium: GetCondominiumUseCase,
  ) {}

  async execute(
    condominiumId: string,
    createdByUserId: string,
    input: CreateAbsenceDto,
  ): Promise<AbsenceResponseDto> {
    await this.getCondominium.getOrFail(condominiumId);
    const employee = await this.employees.findById(input.employeeId, condominiumId);

    if (!employee) {
      throw new ResourceNotFoundError('Funcionário não encontrado.');
    }

    const absence = await this.absences.save(
      EmployeeAbsence.create({
        condominiumId,
        employeeId: input.employeeId,
        reason: input.reason,
        startDate: input.startDate,
        endDate: input.endDate,
        notes: input.notes,
        createdByUserId,
      }),
    );

    return toAbsenceResponse(absence, employee.fullName);
  }
}

@Injectable()
export class UpdateAbsenceUseCase {
  constructor(
    private readonly absences: EmployeeAbsenceRepository,
    private readonly employees: CondoEmployeeRepository,
    private readonly getCondominium: GetCondominiumUseCase,
  ) {}

  async execute(
    condominiumId: string,
    absenceId: string,
    input: UpdateAbsenceDto,
  ): Promise<AbsenceResponseDto> {
    await this.getCondominium.getOrFail(condominiumId);
    const current = await this.absences.findById(absenceId, condominiumId);

    if (!current) {
      throw new ResourceNotFoundError('Justificativa não encontrada.');
    }

    const snapshot = current.toSnapshot();
    const employeeId = input.employeeId ?? snapshot.employeeId;
    const employee = await this.employees.findById(employeeId, condominiumId);

    if (!employee) {
      throw new ResourceNotFoundError('Funcionário não encontrado.');
    }

    const updated = await this.absences.update(
      current.withData({
        employeeId,
        reason: input.reason ?? snapshot.reason,
        startDate: input.startDate ?? toIsoDate(snapshot.startDate),
        endDate: input.endDate ?? toIsoDate(snapshot.endDate),
        notes: input.notes !== undefined ? input.notes : snapshot.notes,
      }),
    );

    return toAbsenceResponse(updated, employee.fullName);
  }
}

@Injectable()
export class ListAbsencesUseCase {
  constructor(
    private readonly absences: EmployeeAbsenceRepository,
    private readonly employees: CondoEmployeeRepository,
    private readonly getCondominium: GetCondominiumUseCase,
  ) {}

  async execute(
    condominiumId: string,
    query: ListAbsencesQueryDto,
  ): Promise<AbsenceResponseDto[]> {
    await this.getCondominium.getOrFail(condominiumId);

    const list = await this.absences.list({
      condominiumId,
      employeeId: query.employeeId,
      reason: query.reason,
      status: query.status,
      from: query.from ? new Date(`${query.from}T00:00:00`) : undefined,
      to: query.to ? new Date(`${query.to}T00:00:00`) : undefined,
    });

    const names = new Map<string, string>();
    const staff = await this.employees.listByCondominium(condominiumId);

    for (const employee of staff) {
      names.set(employee.id, employee.fullName);
    }

    return list.map((absence) =>
      toAbsenceResponse(absence, names.get(absence.employeeId)),
    );
  }
}

@Injectable()
export class DeleteAbsenceUseCase {
  constructor(private readonly absences: EmployeeAbsenceRepository) {}

  async execute(condominiumId: string, absenceId: string): Promise<void> {
    const current = await this.absences.findById(absenceId, condominiumId);

    if (!current) {
      throw new ResourceNotFoundError('Justificativa não encontrada.');
    }

    await this.absences.delete(absenceId, condominiumId);
  }
}

@Injectable()
export class ReviewAbsenceUseCase {
  constructor(
    private readonly absences: EmployeeAbsenceRepository,
    private readonly employees: CondoEmployeeRepository,
    private readonly getCondominium: GetCondominiumUseCase,
  ) {}

  async execute(
    condominiumId: string,
    absenceId: string,
    reviewedByUserId: string,
    input: ReviewAbsenceDto,
  ): Promise<AbsenceResponseDto> {
    await this.getCondominium.getOrFail(condominiumId);
    const current = await this.absences.findById(absenceId, condominiumId);

    if (!current) {
      throw new ResourceNotFoundError('Justificativa não encontrada.');
    }

    if (
      input.status !== AbsenceStatus.Approved &&
      input.status !== AbsenceStatus.Rejected
    ) {
      throw new InvalidFieldError('status', 'Informe APPROVED ou REJECTED.');
    }

    const updated = await this.absences.update(
      current.review({
        status: input.status,
        reviewedByUserId,
        reviewNotes: input.reviewNotes,
      }),
    );

    const employee = await this.employees.findById(updated.employeeId, condominiumId);

    return toAbsenceResponse(updated, employee?.fullName);
  }
}

@Injectable()
export class UploadAbsenceAttachmentUseCase {
  constructor(
    private readonly absences: EmployeeAbsenceRepository,
    private readonly employees: CondoEmployeeRepository,
    private readonly fileStorage: FileStorage,
    private readonly getCondominium: GetCondominiumUseCase,
  ) {}

  async execute(
    condominiumId: string,
    absenceId: string,
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
  ): Promise<AbsenceResponseDto> {
    await this.getCondominium.getOrFail(condominiumId);
    const current = await this.absences.findById(absenceId, condominiumId);

    if (!current) {
      throw new ResourceNotFoundError('Justificativa não encontrada.');
    }

    if (!file?.buffer?.length) {
      throw new InvalidFieldError('file', 'Arquivo do anexo é obrigatório.');
    }

    const storageKey = StorageKeys.absenceAttachment({
      condominiumId,
      absenceId: current.id,
      originalName: file.originalname || 'anexo.pdf',
    });

    await this.fileStorage.save(file.buffer, storageKey, file.mimetype);

    const previousKey = current.attachmentStorageKey;
    const updated = await this.absences.update(current.withAttachment(storageKey));

    if (previousKey && previousKey !== storageKey) {
      try {
        await this.fileStorage.delete(previousKey);
      } catch {
        // Melhor esforço: o novo anexo já foi gravado.
      }
    }

    const employee = await this.employees.findById(updated.employeeId, condominiumId);

    return toAbsenceResponse(updated, employee?.fullName);
  }
}

function toAbsenceResponse(
  absence: EmployeeAbsence,
  employeeName?: string,
): AbsenceResponseDto {
  const s = absence.toSnapshot();

  return {
    id: s.id,
    condominiumId: s.condominiumId,
    employeeId: s.employeeId,
    employeeName,
    reason: s.reason,
    reasonLabel: ABSENCE_REASON_LABELS[s.reason],
    startDate: toIsoDate(s.startDate),
    endDate: toIsoDate(s.endDate),
    notes: s.notes,
    status: s.status,
    attachmentStorageKey: s.attachmentStorageKey,
    hasAttachment: Boolean(s.attachmentStorageKey),
    reviewedByUserId: s.reviewedByUserId,
    reviewedAt: s.reviewedAt?.toISOString() ?? null,
    reviewNotes: s.reviewNotes,
    createdByUserId: s.createdByUserId,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}
