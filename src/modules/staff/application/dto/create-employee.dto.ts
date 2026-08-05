import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

import { AccountType, ContractType } from '../../domain/enums/staff.enums';

export class EmployeeBenefitDto {
  @ApiProperty()
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number | null;
}

export class CreateEmployeeDto {
  @ApiProperty()
  @IsString()
  @Length(3, 150)
  fullName: string;

  @ApiProperty({ example: '529.982.247-25' })
  @IsString()
  cpf: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  rg?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  birthDate?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  gender?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 30)
  maritalStatus?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 80)
  nationality?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 255)
  address?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2)
  state?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d{8}$/, { message: 'CEP deve ter 8 dígitos' })
  zipCode?: string | null;

  @ApiProperty()
  @IsString()
  @Length(2, 100)
  jobTitle: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  department?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  admissionDate?: string | null;

  @ApiPropertyOptional({ enum: ContractType })
  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 200)
  workSchedule?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  notes?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number | null;

  @ApiPropertyOptional({ type: [EmployeeBenefitDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployeeBenefitDto)
  benefits?: EmployeeBenefitDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  bankName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 10)
  bankCode?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  agency?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 30)
  accountNumber?: string | null;

  @ApiPropertyOptional({ enum: AccountType })
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 120)
  pixKey?: string | null;

  @ApiPropertyOptional({ description: 'PIN de 4 a 6 dígitos (obrigatório se algum módulo estiver ligado)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4,6}$/)
  pin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  canAccessTimeClock?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  canAccessVisitors?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  canAccessDeliveries?: boolean;
}
