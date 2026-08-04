import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

const MAX_UNITS = 2000;

export class CreateCondominiumDto {
  @ApiProperty({ example: 'Condomínio Porto Imperial' })
  @IsString()
  @Length(3, 150)
  name: string;

  @ApiProperty({ example: 'porto-imperial', description: 'Identificador público, em kebab-case' })
  @IsString()
  @Length(3, 80)
  slug: string;

  @ApiProperty({
    type: [String],
    example: ['101', '102', '201'],
    description: 'Unidades existentes no condomínio',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_UNITS)
  @IsString({ each: true })
  unitNumbers: string[];

  @ApiPropertyOptional({ example: '2018-04-01', description: 'Data de entrega do prédio' })
  @IsOptional()
  @IsDateString()
  buildingHandoverDate?: string | null;

  @ApiProperty({ example: 'Rua das Palmeiras, 100 - Centro' })
  @IsString()
  @Length(5, 255)
  address: string;

  @ApiProperty({ example: -23.55052 })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: -46.633308 })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ example: 100, description: 'Raio do geofence em metros (50–2000)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(50)
  @Max(2000)
  geofenceRadiusMeters?: number;
}
