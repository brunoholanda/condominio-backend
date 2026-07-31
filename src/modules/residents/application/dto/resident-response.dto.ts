import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { OccupancyType } from '../../domain/enums/occupancy-type';
import {
  ContactPersonDto,
  HouseholdMemberDto,
  PetDto,
  UnitEmployeeDto,
  VehicleDto,
} from './nested-collections.dto';

export class ResidentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  unit: string;

  @ApiProperty({ enum: OccupancyType })
  occupancyType: OccupancyType;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  rg: string;

  @ApiProperty({ description: 'Somente dígitos' })
  cpf: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({ nullable: true })
  landlinePhone: string | null;

  @ApiProperty()
  mobilePhone: string;

  @ApiProperty({ example: '2023-03-15' })
  movedInAt: string;

  @ApiProperty({ type: ContactPersonDto })
  emergencyContact: ContactPersonDto;

  @ApiPropertyOptional({ type: ContactPersonDto, nullable: true })
  landlord: ContactPersonDto | null;

  @ApiProperty({ type: [HouseholdMemberDto] })
  householdMembers: HouseholdMemberDto[];

  @ApiProperty({ type: [UnitEmployeeDto] })
  employees: UnitEmployeeDto[];

  @ApiProperty({ type: [VehicleDto] })
  vehicles: VehicleDto[];

  @ApiProperty({ type: [PetDto] })
  pets: PetDto[];

  @ApiProperty()
  dataUsageConsent: boolean;

  @ApiProperty({ description: 'Assinatura manuscrita em data URL' })
  signature: string;

  @ApiProperty({ example: '2024-01-20' })
  signedAt: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class PaginatedResidentsResponseDto {
  @ApiProperty({ type: [ResidentResponseDto] })
  items: ResidentResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
