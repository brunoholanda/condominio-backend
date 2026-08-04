import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class SetAccountActiveDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  active: boolean;
}
