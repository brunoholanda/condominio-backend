import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

import {
  IsBrazilianPhone,
  IsLicensePlate,
} from '../../../../shared/application/validators/brazilian-formats.validator';
import { PetSpecies } from '../../domain/enums/pet-species';

export class ContactPersonDto {
  @ApiProperty({ example: 'Maria Souza' })
  @IsString()
  @Length(3, 150)
  name: string;

  @ApiProperty({ example: '11988887777', description: 'Somente dígitos, com DDD' })
  @IsBrazilianPhone()
  phone: string;
}

export class HouseholdMemberDto {
  @ApiProperty({ example: 'João Souza' })
  @IsString()
  @Length(3, 150)
  fullName: string;

  @ApiProperty({ example: '12.345.678-9' })
  @IsString()
  @Length(5, 20)
  rg: string;

  @ApiProperty({ example: 'Filho' })
  @IsString()
  @Length(2, 60)
  kinship: string;
}

export class UnitEmployeeDto {
  @ApiProperty({ example: 'Ana Lima' })
  @IsString()
  @Length(3, 150)
  fullName: string;

  @ApiProperty({ example: '98.765.432-1' })
  @IsString()
  @Length(5, 20)
  rg: string;

  @ApiProperty({ example: 'Diarista' })
  @IsString()
  @Length(2, 60)
  role: string;

  @ApiProperty({ example: 'Segundas e quartas, 8h às 17h' })
  @IsString()
  @Length(2, 60)
  workSchedule: string;
}

export class VehicleDto {
  @ApiProperty({ example: 'Volkswagen' })
  @IsString()
  @Length(2, 60)
  brand: string;

  @ApiProperty({ example: 'Polo' })
  @IsString()
  @Length(1, 60)
  model: string;

  @ApiProperty({ example: 'Prata' })
  @IsString()
  @Length(3, 40)
  color: string;

  @ApiProperty({ example: 'ABC1D23' })
  @IsLicensePlate()
  plate: string;
}

export class PetDto {
  @ApiProperty({ example: 'Rex' })
  @IsString()
  @Length(1, 60)
  name: string;

  @ApiProperty({ enum: PetSpecies, example: PetSpecies.Dog })
  @IsEnum(PetSpecies)
  species: PetSpecies;

  @ApiPropertyOptional({ example: 'Labrador' })
  @IsOptional()
  @IsString()
  @Length(2, 60)
  breed?: string | null;

  @ApiProperty({ example: 'Caramelo' })
  @IsString()
  @Length(3, 40)
  color: string;
}
