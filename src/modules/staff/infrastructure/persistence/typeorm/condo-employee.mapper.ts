import type { DeepPartial } from 'typeorm';

import { toIsoDate } from '../../../../../shared/application/date-format';
import type { CondoEmployeeSnapshot } from '../../../domain/entities/condo-employee';
import { CondoEmployee } from '../../../domain/entities/condo-employee';
import type { AccountType, ContractType } from '../../../domain/enums/staff.enums';
import type { CondoEmployeeOrmEntity } from './entities/condo-employee.orm-entity';

function toNumberOrNull(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const num = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(num) ? num : null;
}

export class CondoEmployeeMapper {
  static toDomain(row: CondoEmployeeOrmEntity): CondoEmployee {
    const snapshot: CondoEmployeeSnapshot = {
      id: row.id,
      condominiumId: row.condominiumId,
      fullName: row.fullName,
      cpf: row.cpf,
      rg: row.rg,
      birthDate: row.birthDate ? new Date(row.birthDate) : null,
      gender: row.gender,
      maritalStatus: row.maritalStatus,
      nationality: row.nationality,
      phone: row.phone,
      email: row.email,
      address: row.address,
      city: row.city,
      state: row.state,
      zipCode: row.zipCode,
      jobTitle: row.jobTitle,
      department: row.department,
      admissionDate: row.admissionDate ? new Date(row.admissionDate) : null,
      contractType: row.contractType as ContractType,
      workSchedule: row.workSchedule,
      notes: row.notes,
      salary: toNumberOrNull(row.salary),
      benefits: Array.isArray(row.benefits) ? row.benefits : [],
      bankName: row.bankName,
      bankCode: row.bankCode,
      agency: row.agency,
      accountNumber: row.accountNumber,
      accountType: (row.accountType as AccountType | null) ?? null,
      pixKey: row.pixKey,
      pinHash: row.pinHash,
      isActive: row.isActive,
      canAccessTimeClock: row.canAccessTimeClock !== false,
      canAccessVisitors: row.canAccessVisitors === true,
      canAccessDeliveries: row.canAccessDeliveries === true,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    return CondoEmployee.restore(snapshot);
  }

  static toPersistence(employee: CondoEmployee): DeepPartial<CondoEmployeeOrmEntity> {
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
      salary: s.salary !== null ? String(s.salary) : null,
      benefits: s.benefits,
      bankName: s.bankName,
      bankCode: s.bankCode,
      agency: s.agency,
      accountNumber: s.accountNumber,
      accountType: s.accountType,
      pixKey: s.pixKey,
      pinHash: s.pinHash,
      isActive: s.isActive,
      canAccessTimeClock: s.canAccessTimeClock,
      canAccessVisitors: s.canAccessVisitors,
      canAccessDeliveries: s.canAccessDeliveries,
    };
  }
}
