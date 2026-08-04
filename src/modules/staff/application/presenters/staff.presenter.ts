import { toIsoDate } from '../../../../shared/application/date-format';
import type { CondoEmployee } from '../../domain/entities/condo-employee';
import type { TimePunch } from '../../domain/entities/time-punch';
import type {
  EmployeeListItemDto,
  EmployeeResponseDto,
} from '../dto/employee-response.dto';
import type { TimePunchResponseDto } from '../dto/time-punch-response.dto';

export class EmployeePresenter {
  static toResponse(employee: CondoEmployee): EmployeeResponseDto {
    const s = employee.toSnapshot();

    return {
      id: s.id,
      condominiumId: s.condominiumId,
      fullName: s.fullName,
      cpf: s.cpf,
      rg: s.rg,
      birthDate: s.birthDate ? toIsoDate(s.birthDate) : null,
      gender: s.gender,
      maritalStatus: s.maritalStatus,
      nationality: s.nationality,
      phone: s.phone,
      email: s.email,
      address: s.address,
      city: s.city,
      state: s.state,
      zipCode: s.zipCode,
      jobTitle: s.jobTitle,
      department: s.department,
      admissionDate: s.admissionDate ? toIsoDate(s.admissionDate) : null,
      contractType: s.contractType,
      workSchedule: s.workSchedule,
      notes: s.notes,
      salary: s.salary,
      benefits: s.benefits,
      bankName: s.bankName,
      bankCode: s.bankCode,
      agency: s.agency,
      accountNumber: s.accountNumber,
      accountType: s.accountType,
      pixKey: s.pixKey,
      isActive: s.isActive,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    };
  }

  static toListItem(employee: CondoEmployee): EmployeeListItemDto {
    const s = employee.toSnapshot();

    return {
      id: s.id,
      fullName: s.fullName,
      cpf: s.cpf,
      jobTitle: s.jobTitle,
      department: s.department,
      isActive: s.isActive,
      phone: s.phone,
    };
  }
}

export class TimePunchPresenter {
  static toResponse(punch: TimePunch, employeeName?: string): TimePunchResponseDto {
    const s = punch.toSnapshot();

    return {
      id: s.id,
      condominiumId: s.condominiumId,
      employeeId: s.employeeId,
      employeeName,
      type: s.type,
      status: s.status,
      punchedAt: s.punchedAt.toISOString(),
      latitude: s.latitude,
      longitude: s.longitude,
      accuracyMeters: s.accuracyMeters,
      distanceMeters: s.distanceMeters,
      hasSelfie: Boolean(s.selfieStorageKey),
      rejectedReason: s.rejectedReason,
      createdAt: s.createdAt.toISOString(),
    };
  }
}
