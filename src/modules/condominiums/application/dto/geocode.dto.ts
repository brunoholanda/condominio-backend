import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Length, Matches } from 'class-validator';

export class GeocodeQueryDto {
  @ApiProperty({ example: 'Rua das Palmeiras, 100, São Paulo, SP' })
  @IsString()
  @Length(3, 255)
  q: string;
}

export class GeocodeSuggestQueryDto {
  @ApiProperty({ example: 'Rua das Palmeiras Campinas' })
  @IsString()
  @Length(3, 255)
  q: string;
}

export class CepParamDto {
  @ApiProperty({ example: '13010000', description: 'CEP com 8 dígitos (com ou sem máscara)' })
  @Transform(({ value }) => String(value ?? '').replace(/\D/g, ''))
  @IsString()
  @Matches(/^\d{8}$/, { message: 'CEP deve conter 8 dígitos.' })
  cep: string;
}

export class AddressPartsDto {
  @ApiPropertyOptional({ example: 'Rua das Palmeiras' })
  street?: string;

  @ApiPropertyOptional({ example: '100' })
  number?: string;

  @ApiPropertyOptional({ example: 'Centro' })
  neighborhood?: string;

  @ApiPropertyOptional({ example: 'Campinas' })
  city?: string;

  @ApiPropertyOptional({ example: 'SP' })
  state?: string;

  @ApiPropertyOptional({ example: '13010-000' })
  zipCode?: string;
}

export class GeocodeResultDto extends AddressPartsDto {
  @ApiProperty()
  displayName: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiPropertyOptional({
    description: 'Endereço formatado (rua, número, bairro, cidade, UF, CEP)',
  })
  address?: string;
}

export class GeocodeSuggestItemDto extends AddressPartsDto {
  @ApiProperty()
  displayName: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  address: string;
}
