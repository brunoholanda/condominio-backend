import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AccountType, ContractType } from '../../domain/enums/staff.enums';
import { EmployeeBenefitDto } from './create-employee.dto';

export class EmployeeResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  condominiumId: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  cpf: string;

  @ApiPropertyOptional({ nullable: true })
  rg: string | null;

  @ApiPropertyOptional({ nullable: true })
  birthDate: string | null;

  @ApiPropertyOptional({ nullable: true })
  gender: string | null;

  @ApiPropertyOptional({ nullable: true })
  maritalStatus: string | null;

  @ApiPropertyOptional({ nullable: true })
  nationality: string | null;

  @ApiPropertyOptional({ nullable: true })
  phone: string | null;

  @ApiPropertyOptional({ nullable: true })
  email: string | null;

  @ApiPropertyOptional({ nullable: true })
  address: string | null;

  @ApiPropertyOptional({ nullable: true })
  city: string | null;

  @ApiPropertyOptional({ nullable: true })
  state: string | null;

  @ApiPropertyOptional({ nullable: true })
  zipCode: string | null;

  @ApiProperty()
  jobTitle: string;

  @ApiPropertyOptional({ nullable: true })
  department: string | null;

  @ApiPropertyOptional({ nullable: true })
  admissionDate: string | null;

  @ApiProperty({ enum: ContractType })
  contractType: ContractType;

  @ApiPropertyOptional({ nullable: true })
  workSchedule: string | null;

  @ApiPropertyOptional({ nullable: true })
  notes: string | null;

  @ApiPropertyOptional({ nullable: true })
  salary: number | null;

  @ApiProperty({ type: [EmployeeBenefitDto] })
  benefits: EmployeeBenefitDto[];

  @ApiPropertyOptional({ nullable: true })
  bankName: string | null;

  @ApiPropertyOptional({ nullable: true })
  bankCode: string | null;

  @ApiPropertyOptional({ nullable: true })
  agency: string | null;

  @ApiPropertyOptional({ nullable: true })
  accountNumber: string | null;

  @ApiPropertyOptional({ enum: AccountType, nullable: true })
  accountType: AccountType | null;

  @ApiPropertyOptional({ nullable: true })
  pixKey: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  canAccessTimeClock: boolean;

  @ApiProperty()
  canAccessVisitors: boolean;

  @ApiProperty()
  canAccessDeliveries: boolean;

  @ApiProperty()
  hasPin: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class EmployeeListItemDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  cpf: string;

  @ApiProperty()
  jobTitle: string;

  @ApiPropertyOptional({ nullable: true })
  department: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional({ nullable: true })
  phone: string | null;
}
