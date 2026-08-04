import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

import {
  PUBLIC_QR_TARGETS,
  type PublicQrTarget,
} from '../../domain/public-qr-target';

export class GeneratePublicQrQueryDto {
  @ApiPropertyOptional({
    enum: PUBLIC_QR_TARGETS,
    default: 'hub',
    description: 'Destino público codificado no QR',
  })
  @IsOptional()
  @IsIn([...PUBLIC_QR_TARGETS])
  target?: PublicQrTarget;
}
