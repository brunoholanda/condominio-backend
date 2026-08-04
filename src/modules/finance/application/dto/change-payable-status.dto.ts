import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class ChangePayableStatusDto {
  @ApiPropertyOptional({ example: 'Pago via PIX em 05/09.' })
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  note?: string;
}
