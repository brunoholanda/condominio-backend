import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

import { PUBLIC_HUB_LINKS, type PublicHubLink } from '../../domain/public-qr-target';
import { CreateCondominiumDto } from './create-condominium.dto';

const MAX_UNITS = 2000;

export class UpdateCondominiumDto extends PartialType(CreateCondominiumDto) {
  @ApiPropertyOptional({
    type: [String],
    description: 'Quando enviado, substitui o catálogo de unidades do condomínio',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_UNITS)
  @IsString({ each: true })
  unitNumbers?: string[];

  @ApiPropertyOptional({
    enum: PUBLIC_HUB_LINKS,
    isArray: true,
    description: 'Quais atalhos aparecem no hub público (lista vazia oculta todos)',
  })
  @IsOptional()
  @IsArray()
  @IsIn([...PUBLIC_HUB_LINKS], { each: true })
  publicHubLinks?: PublicHubLink[];
}
