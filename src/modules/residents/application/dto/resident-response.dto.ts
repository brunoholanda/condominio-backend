import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';

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

  @ApiProperty({ format: 'uuid' })
  condominiumId: string;

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

  @ApiProperty({
    example: '2024-01-20T13:45:12.000Z',
    description: 'Data e hora da assinatura, registradas pelo servidor',
  })
  signedAt: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

/**
 * A listagem existe para achar o cadastro, não para exibi-lo: mandar a
 * assinatura de cada morador junto seria expor um dado pessoal que nenhuma
 * coluna da tabela usa. Quem precisa dela busca o cadastro pelo id.
 */
export class ResidentListItemDto extends OmitType(ResidentResponseDto, ['signature'] as const) {}

export class PaginatedResidentsResponseDto {
  @ApiProperty({ type: [ResidentListItemDto] })
  items: ResidentListItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
