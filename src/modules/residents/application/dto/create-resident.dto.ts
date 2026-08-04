import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

import {
  IsBrazilianPhone,
  IsCpf,
  IsSignatureImage,
} from '../../../../shared/application/validators/brazilian-formats.validator';
import { OccupancyType } from '../../domain/enums/occupancy-type';
import {
  ContactPersonDto,
  HouseholdMemberDto,
  PetDto,
  UnitEmployeeDto,
  VehicleDto,
} from './nested-collections.dto';

const MAX_COLLECTION_SIZE = 20;

/**
 * Payload of the "Cadastro de Morador" form.
 *
 * `signedAt` is deliberately absent: the moment of the signature belongs to the
 * server clock, so no client can choose or edit it.
 */
export class CreateResidentDto {
  @ApiProperty({
    example: '101',
    description: 'Unidade/apartamento existente no condomínio',
  })
  @IsString()
  @Length(1, 20)
  unit: string;

  @ApiProperty({ enum: OccupancyType, example: OccupancyType.Owner })
  @IsEnum(OccupancyType)
  occupancyType: OccupancyType;

  @ApiProperty({ example: 'Carlos Eduardo Pereira' })
  @IsString()
  @Length(3, 150)
  fullName: string;

  @ApiProperty({ example: '12.345.678-9' })
  @IsString()
  @Length(5, 20)
  rg: string;

  @ApiProperty({ example: '52998224725' })
  @IsCpf()
  cpf: string;

  @ApiProperty({ example: 'carlos@exemplo.com.br' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '1132165498', description: 'Telefone fixo' })
  @IsOptional()
  @IsBrazilianPhone()
  landlinePhone?: string | null;

  @ApiProperty({ example: '11988887777', description: 'Celular' })
  @IsBrazilianPhone()
  mobilePhone: string;

  @ApiProperty({ example: '2023-03-15', description: 'Quando mudou-se (ISO 8601)' })
  @IsDateString()
  movedInAt: string;

  @ApiProperty({ type: ContactPersonDto, description: 'Em caso de emergência procurar por' })
  @ValidateNested()
  @Type(() => ContactPersonDto)
  emergencyContact: ContactPersonDto;

  @ApiPropertyOptional({
    type: ContactPersonDto,
    description: 'Proprietário/administradora. Obrigatório quando occupancyType = TENANT',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactPersonDto)
  landlord?: ContactPersonDto | null;

  @ApiPropertyOptional({ type: [HouseholdMemberDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_COLLECTION_SIZE)
  @ValidateNested({ each: true })
  @Type(() => HouseholdMemberDto)
  householdMembers?: HouseholdMemberDto[];

  @ApiPropertyOptional({ type: [UnitEmployeeDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_COLLECTION_SIZE)
  @ValidateNested({ each: true })
  @Type(() => UnitEmployeeDto)
  employees?: UnitEmployeeDto[];

  @ApiPropertyOptional({ type: [VehicleDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_COLLECTION_SIZE)
  @ValidateNested({ each: true })
  @Type(() => VehicleDto)
  vehicles?: VehicleDto[];

  @ApiPropertyOptional({ type: [PetDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_COLLECTION_SIZE)
  @ValidateNested({ each: true })
  @Type(() => PetDto)
  pets?: PetDto[];

  @ApiProperty({ example: true, description: 'Autorização de uso dos dados (LGPD)' })
  @IsBoolean()
  dataUsageConsent: boolean;

  @ApiProperty({
    example: 'data:image/png;base64,iVBORw0KGgo...',
    description: 'Assinatura manuscrita em data URL (PNG ou JPEG)',
  })
  @IsSignatureImage()
  signature: string;
}
