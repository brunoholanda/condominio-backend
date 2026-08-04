import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

import { CreateEmployeeDto } from './create-employee.dto';

export class UpdateEmployeeDto extends PartialType(
  OmitType(CreateEmployeeDto, ['pin'] as const),
) {
  @ApiPropertyOptional({ description: 'Novo PIN (4–6 dígitos). Omita para manter o atual.' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4,6}$/)
  pin?: string;
}
