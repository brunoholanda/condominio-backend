import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class UpsertAsaasSettingsDto {
  @ApiProperty({ description: 'Chave de API Asaas do condomínio' })
  @IsString()
  @Length(10, 500)
  apiKey: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 64)
  walletId?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class GenerateChargesDto {
  @ApiProperty({ example: 'Taxa condominial março/2026' })
  @IsString()
  @Length(3, 200)
  description: string;

  @ApiProperty({ example: '2026-03-01', description: 'Primeiro dia do mês de competência' })
  @IsDateString()
  referenceMonth: string;

  @ApiProperty({ example: '2026-03-10' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ example: 35000, description: 'Valor em centavos' })
  @IsInt()
  @Min(1)
  amountCents: number;

  @ApiProperty({ type: [String], example: ['101', '102'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Length(1, 20, { each: true })
  unitNumbers: string[];
}

export class ChargeFiltersQueryDto {
  @ApiPropertyOptional({ enum: ['PENDING', 'PAID', 'CANCELLED'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  unitNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 64)
  batchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;
}

export class CancelChargeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  note?: string | null;
}
