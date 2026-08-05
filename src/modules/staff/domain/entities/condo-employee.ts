import { randomUUID } from 'node:crypto';

import { InvalidFieldError } from '../../../../shared/domain/domain-error';
import { optionalText, requireDate, requireEnum, requireText } from '../../../../shared/domain/guards';
import { Cpf } from '../../../../shared/domain/value-objects/cpf';
import { AccountType, ContractType } from '../enums/staff.enums';

export interface EmployeeBenefit {
  name: string;
  value?: number | null;
}

export interface CondoEmployeeProps {
  condominiumId: string;
  fullName: string;
  cpf: string;
  rg?: string | null;
  birthDate?: Date | string | null;
  gender?: string | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  jobTitle: string;
  department?: string | null;
  admissionDate?: Date | string | null;
  contractType?: ContractType | string;
  workSchedule?: string | null;
  notes?: string | null;
  salary?: number | null;
  benefits?: EmployeeBenefit[];
  bankName?: string | null;
  bankCode?: string | null;
  agency?: string | null;
  accountNumber?: string | null;
  accountType?: AccountType | string | null;
  pixKey?: string | null;
  pinHash?: string | null;
  isActive?: boolean;
  canAccessTimeClock?: boolean;
  canAccessVisitors?: boolean;
  canAccessDeliveries?: boolean;
}

export interface CondoEmployeeSnapshot {
  id: string;
  condominiumId: string;
  fullName: string;
  cpf: string;
  rg: string | null;
  birthDate: Date | null;
  gender: string | null;
  maritalStatus: string | null;
  nationality: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  jobTitle: string;
  department: string | null;
  admissionDate: Date | null;
  contractType: ContractType;
  workSchedule: string | null;
  notes: string | null;
  salary: number | null;
  benefits: EmployeeBenefit[];
  bankName: string | null;
  bankCode: string | null;
  agency: string | null;
  accountNumber: string | null;
  accountType: AccountType | null;
  pixKey: string | null;
  pinHash: string | null;
  isActive: boolean;
  canAccessTimeClock: boolean;
  canAccessVisitors: boolean;
  canAccessDeliveries: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CondoEmployeeState extends CondoEmployeeSnapshot {}

export class CondoEmployee {
  private constructor(private readonly state: CondoEmployeeState) {}

  static create(props: CondoEmployeeProps): CondoEmployee {
    const now = new Date();

    return new CondoEmployee({
      ...CondoEmployee.parse(props),
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(snapshot: CondoEmployeeSnapshot): CondoEmployee {
    return new CondoEmployee({ ...snapshot });
  }

  withData(
    props: Omit<CondoEmployeeProps, 'condominiumId' | 'pinHash'> & { pinHash?: string | null },
  ): CondoEmployee {
    return new CondoEmployee({
      ...CondoEmployee.parse({
        ...props,
        condominiumId: this.state.condominiumId,
        pinHash: props.pinHash !== undefined ? props.pinHash : this.state.pinHash,
      }),
      id: this.state.id,
      createdAt: this.state.createdAt,
      updatedAt: new Date(),
    });
  }

  withPinHash(pinHash: string | null): CondoEmployee {
    return new CondoEmployee({
      ...this.state,
      pinHash,
      updatedAt: new Date(),
    });
  }

  hasPortalAccess(): boolean {
    return this.state.canAccessTimeClock || this.state.canAccessVisitors || this.state.canAccessDeliveries;
  }

  private static parse(props: CondoEmployeeProps): Omit<CondoEmployeeState, 'id' | 'createdAt' | 'updatedAt'> {
    const cpf = Cpf.create(props.cpf);
    const salary =
      props.salary === null || props.salary === undefined || props.salary === ('' as unknown)
        ? null
        : CondoEmployee.parseSalary(props.salary);

    const accountTypeRaw = props.accountType;
    const accountType =
      accountTypeRaw === null || accountTypeRaw === undefined || accountTypeRaw === ''
        ? null
        : requireEnum('tipo de conta', accountTypeRaw, AccountType);

    const canAccessTimeClock = props.canAccessTimeClock !== false;
    const canAccessVisitors = props.canAccessVisitors === true;
    const canAccessDeliveries = props.canAccessDeliveries === true;
    const needsPortal =
      canAccessTimeClock || canAccessVisitors || canAccessDeliveries;

    let pinHash: string | null = props.pinHash ?? null;

    if (needsPortal) {
      pinHash = requireText('PIN', pinHash, { min: 20, max: 255 });
    } else if (pinHash) {
      pinHash = requireText('PIN', pinHash, { min: 20, max: 255 });
    } else {
      pinHash = null;
    }

    return {
      condominiumId: requireText('condomínio', props.condominiumId, { min: 36, max: 36 }),
      fullName: requireText('nome completo', props.fullName, { min: 3, max: 150 }),
      cpf: cpf.value,
      rg: optionalText('RG', props.rg, { max: 20 }),
      birthDate: CondoEmployee.parseOptionalDate('data de nascimento', props.birthDate),
      gender: optionalText('gênero', props.gender, { max: 20 }),
      maritalStatus: optionalText('estado civil', props.maritalStatus, { max: 30 }),
      nationality: optionalText('nacionalidade', props.nationality, { max: 80 }),
      phone: optionalText('telefone', props.phone, { max: 20 }),
      email: optionalText('e-mail', props.email, { max: 150 }),
      address: optionalText('endereço', props.address, { max: 255 }),
      city: optionalText('cidade', props.city, { max: 100 }),
      state: optionalText('UF', props.state, { min: 2, max: 2 }),
      zipCode: optionalText('CEP', props.zipCode, { min: 8, max: 8 }),
      jobTitle: requireText('cargo', props.jobTitle, { min: 2, max: 100 }),
      department: optionalText('departamento', props.department, { max: 100 }),
      admissionDate: CondoEmployee.parseOptionalDate('data de admissão', props.admissionDate),
      contractType: requireEnum(
        'tipo de contrato',
        props.contractType ?? ContractType.Clt,
        ContractType,
      ),
      workSchedule: optionalText('jornada', props.workSchedule, { max: 200 }),
      notes: optionalText('observações', props.notes, { max: 2000 }),
      salary,
      benefits: CondoEmployee.parseBenefits(props.benefits),
      bankName: optionalText('banco', props.bankName, { max: 100 }),
      bankCode: optionalText('código do banco', props.bankCode, { max: 10 }),
      agency: optionalText('agência', props.agency, { max: 20 }),
      accountNumber: optionalText('conta', props.accountNumber, { max: 30 }),
      accountType,
      pixKey: optionalText('chave PIX', props.pixKey, { max: 120 }),
      pinHash,
      isActive: props.isActive !== false,
      canAccessTimeClock,
      canAccessVisitors,
      canAccessDeliveries,
    };
  }

  private static parseSalary(value: unknown): number {
    const num = typeof value === 'number' ? value : Number(value);

    if (!Number.isFinite(num) || num < 0) {
      throw new InvalidFieldError('salário', 'O salário deve ser um número positivo.');
    }

    return Math.round(num * 100) / 100;
  }

  private static parseOptionalDate(field: string, value?: Date | string | null): Date | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    return requireDate(field, value);
  }

  private static parseBenefits(raw?: EmployeeBenefit[]): EmployeeBenefit[] {
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.map((item, index) => {
      const name = requireText(`benefício ${index + 1}`, item?.name, { min: 1, max: 100 });
      const value =
        item?.value === null || item?.value === undefined || item?.value === ('' as unknown)
          ? null
          : CondoEmployee.parseSalary(item.value);

      return { name, value };
    });
  }

  get id(): string {
    return this.state.id;
  }

  get condominiumId(): string {
    return this.state.condominiumId;
  }

  get cpf(): string {
    return this.state.cpf;
  }

  get pinHash(): string | null {
    return this.state.pinHash;
  }

  get isActive(): boolean {
    return this.state.isActive;
  }

  get fullName(): string {
    return this.state.fullName;
  }

  get jobTitle(): string {
    return this.state.jobTitle;
  }

  get canAccessTimeClock(): boolean {
    return this.state.canAccessTimeClock;
  }

  get canAccessVisitors(): boolean {
    return this.state.canAccessVisitors;
  }

  get canAccessDeliveries(): boolean {
    return this.state.canAccessDeliveries;
  }

  toSnapshot(): CondoEmployeeSnapshot {
    return {
      ...this.state,
      benefits: this.state.benefits.map((b) => ({ ...b })),
    };
  }
}

export function assertValidPin(pin: unknown): string {
  const value = typeof pin === 'string' ? pin.trim() : '';

  if (!/^\d{4,6}$/.test(value)) {
    throw new InvalidFieldError('PIN', 'O PIN deve ter de 4 a 6 dígitos numéricos.');
  }

  return value;
}
