import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, IsString, Length } from 'class-validator';

import { OccupancyType } from '../../domain/enums/occupancy-type';
import { CONDO_UNITS } from '../../domain/value-objects/unit';

/** Filters shared by the listing and the PDF report. */
export class ResidentFiltersQueryDto {
  @ApiPropertyOptional({ description: 'Busca por nome, unidade, CPF ou e-mail' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : undefined))
  search?: string;

  @ApiPropertyOptional({ example: '101', enum: CONDO_UNITS })
  @IsOptional()
  @IsIn(CONDO_UNITS)
  unit?: string;

  @ApiPropertyOptional({ enum: OccupancyType })
  @IsOptional()
  @IsEnum(OccupancyType)
  occupancyType?: OccupancyType;
}
