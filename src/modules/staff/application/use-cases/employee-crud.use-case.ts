import { Injectable } from '@nestjs/common';

import {
  BusinessRuleError,
  InvalidFieldError,
  ResourceConflictError,
  ResourceNotFoundError,
} from '../../../../shared/domain/domain-error';
import { Cpf } from '../../../../shared/domain/value-objects/cpf';
import { PasswordHasher } from '../../../auth/domain/services/password-hasher';
import { GetCondominiumUseCase } from '../../../condominiums/application/use-cases/get-condominium.use-case';
import { assertValidPin, CondoEmployee } from '../../domain/entities/condo-employee';
import { CondoEmployeeRepository } from '../../domain/repositories/condo-employee.repository';
import type { CreateEmployeeDto } from '../dto/create-employee.dto';
import type { EmployeeResponseDto } from '../dto/employee-response.dto';
import { EmployeePresenter } from '../presenters/staff.presenter';

@Injectable()
export class CreateEmployeeUseCase {
  constructor(
    private readonly employees: CondoEmployeeRepository,
    private readonly getCondominium: GetCondominiumUseCase,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(condominiumId: string, input: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    const condo = await this.getCondominium.getOrFail(condominiumId);

    if (!condo.hasLocation()) {
      throw new BusinessRuleError(
        'Cadastre o endereço e a localização do condomínio antes de adicionar funcionários.',
        'CONDO_LOCATION_REQUIRED',
      );
    }

    const cpf = Cpf.create(input.cpf);
    const existing = await this.employees.findIdByCpf(cpf.value, condominiumId);

    if (existing) {
      throw new ResourceConflictError('Já existe um funcionário com este CPF neste condomínio.');
    }

    const canAccessTimeClock = input.canAccessTimeClock !== false;
    const canAccessVisitors = input.canAccessVisitors === true;
    const canAccessDeliveries = input.canAccessDeliveries === true;
    const needsPortal = canAccessTimeClock || canAccessVisitors || canAccessDeliveries;

    let pinHash: string | null = null;

    if (needsPortal) {
      if (!input.pin) {
        throw new InvalidFieldError(
          'PIN',
          'Informe o PIN: ele é obrigatório quando há módulos do portal liberados.',
        );
      }

      pinHash = await this.passwordHasher.hash(assertValidPin(input.pin));
    } else if (input.pin) {
      pinHash = await this.passwordHasher.hash(assertValidPin(input.pin));
    }

    const employee = await this.employees.save(
      CondoEmployee.create({
        ...input,
        condominiumId,
        cpf: cpf.value,
        pinHash,
        canAccessTimeClock,
        canAccessVisitors,
        canAccessDeliveries,
      }),
    );

    return EmployeePresenter.toResponse(employee);
  }
}

@Injectable()
export class UpdateEmployeeUseCase {
  constructor(
    private readonly employees: CondoEmployeeRepository,
    private readonly getCondominium: GetCondominiumUseCase,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(
    condominiumId: string,
    employeeId: string,
    input: import('../dto/update-employee.dto').UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    await this.getCondominium.getOrFail(condominiumId);

    const current = await this.employees.findById(employeeId, condominiumId);

    if (!current) {
      throw new ResourceNotFoundError('Funcionário não encontrado.');
    }

    const snapshot = current.toSnapshot();
    const canAccessTimeClock =
      input.canAccessTimeClock !== undefined ? input.canAccessTimeClock : snapshot.canAccessTimeClock;
    const canAccessVisitors =
      input.canAccessVisitors !== undefined ? input.canAccessVisitors : snapshot.canAccessVisitors;
    const canAccessDeliveries =
      input.canAccessDeliveries !== undefined
        ? input.canAccessDeliveries
        : snapshot.canAccessDeliveries;
    const needsPortal = canAccessTimeClock || canAccessVisitors || canAccessDeliveries;

    let pinHash = snapshot.pinHash;

    if (input.pin) {
      pinHash = await this.passwordHasher.hash(assertValidPin(input.pin));
    }

    if (needsPortal && !pinHash) {
      throw new InvalidFieldError(
        'PIN',
        'Informe o PIN: ele é obrigatório quando há módulos do portal liberados.',
      );
    }

    if (input.cpf) {
      const cpf = Cpf.create(input.cpf);
      const owner = await this.employees.findIdByCpf(cpf.value, condominiumId);

      if (owner && owner !== employeeId) {
        throw new ResourceConflictError('Já existe um funcionário com este CPF neste condomínio.');
      }
    }

    const updated = current.withData({
      fullName: input.fullName ?? snapshot.fullName,
      cpf: input.cpf ?? snapshot.cpf,
      rg: input.rg !== undefined ? input.rg : snapshot.rg,
      birthDate: input.birthDate !== undefined ? input.birthDate : snapshot.birthDate,
      gender: input.gender !== undefined ? input.gender : snapshot.gender,
      maritalStatus:
        input.maritalStatus !== undefined ? input.maritalStatus : snapshot.maritalStatus,
      nationality: input.nationality !== undefined ? input.nationality : snapshot.nationality,
      phone: input.phone !== undefined ? input.phone : snapshot.phone,
      email: input.email !== undefined ? input.email : snapshot.email,
      address: input.address !== undefined ? input.address : snapshot.address,
      city: input.city !== undefined ? input.city : snapshot.city,
      state: input.state !== undefined ? input.state : snapshot.state,
      zipCode: input.zipCode !== undefined ? input.zipCode : snapshot.zipCode,
      jobTitle: input.jobTitle ?? snapshot.jobTitle,
      department: input.department !== undefined ? input.department : snapshot.department,
      admissionDate:
        input.admissionDate !== undefined ? input.admissionDate : snapshot.admissionDate,
      contractType: input.contractType ?? snapshot.contractType,
      workSchedule: input.workSchedule !== undefined ? input.workSchedule : snapshot.workSchedule,
      notes: input.notes !== undefined ? input.notes : snapshot.notes,
      salary: input.salary !== undefined ? input.salary : snapshot.salary,
      benefits: input.benefits !== undefined ? input.benefits : snapshot.benefits,
      bankName: input.bankName !== undefined ? input.bankName : snapshot.bankName,
      bankCode: input.bankCode !== undefined ? input.bankCode : snapshot.bankCode,
      agency: input.agency !== undefined ? input.agency : snapshot.agency,
      accountNumber:
        input.accountNumber !== undefined ? input.accountNumber : snapshot.accountNumber,
      accountType: input.accountType !== undefined ? input.accountType : snapshot.accountType,
      pixKey: input.pixKey !== undefined ? input.pixKey : snapshot.pixKey,
      isActive: input.isActive !== undefined ? input.isActive : snapshot.isActive,
      canAccessTimeClock,
      canAccessVisitors,
      canAccessDeliveries,
      pinHash,
    });

    return EmployeePresenter.toResponse(await this.employees.update(updated));
  }
}

@Injectable()
export class ListEmployeesUseCase {
  constructor(private readonly employees: CondoEmployeeRepository) {}

  async execute(condominiumId: string) {
    const list = await this.employees.listByCondominium(condominiumId);

    return list.map((employee) => EmployeePresenter.toListItem(employee));
  }
}

@Injectable()
export class GetEmployeeUseCase {
  constructor(private readonly employees: CondoEmployeeRepository) {}

  async execute(condominiumId: string, employeeId: string): Promise<EmployeeResponseDto> {
    const employee = await this.employees.findById(employeeId, condominiumId);

    if (!employee) {
      throw new ResourceNotFoundError('Funcionário não encontrado.');
    }

    return EmployeePresenter.toResponse(employee);
  }

  async getOrFail(condominiumId: string, employeeId: string) {
    const employee = await this.employees.findById(employeeId, condominiumId);

    if (!employee) {
      throw new ResourceNotFoundError('Funcionário não encontrado.');
    }

    return employee;
  }
}

@Injectable()
export class DeleteEmployeeUseCase {
  constructor(private readonly employees: CondoEmployeeRepository) {}

  async execute(condominiumId: string, employeeId: string): Promise<void> {
    const employee = await this.employees.findById(employeeId, condominiumId);

    if (!employee) {
      throw new ResourceNotFoundError('Funcionário não encontrado.');
    }

    await this.employees.delete(employeeId, condominiumId);
  }
}
