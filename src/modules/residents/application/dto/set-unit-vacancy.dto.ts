import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, Length } from 'class-validator';

export class SetUnitVacancyDto {
  @ApiProperty({ example: '101' })
  @IsString()
  @Length(1, 20)
  unitNumber: string;

  @ApiProperty({
    example: true,
    description: 'true = ninguém mora na unidade no momento; false = volta à lista de pendentes',
  })
  @IsBoolean()
  vacant: boolean;
}
