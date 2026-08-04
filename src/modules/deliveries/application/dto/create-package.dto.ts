import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class CreatePackageDto {
  @ApiProperty({ example: '101' })
  @IsString()
  @Length(1, 20)
  unitNumber: string;

  @ApiProperty({ example: 'Caixa média — Amazon' })
  @IsString()
  @Length(2, 200)
  description: string;

  @ApiPropertyOptional({ example: 'Correios' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  carrier?: string | null;

  @ApiPropertyOptional({ example: 'Deixar na portaria até as 20h.' })
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  notes?: string | null;
}
