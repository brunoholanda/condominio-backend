import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

import { IsSignatureImage } from '../../../../shared/application/validators/brazilian-formats.validator';

export class DeliverPackageDto {
  @ApiProperty({ example: 'Carlos Eduardo Pereira' })
  @IsString()
  @Length(3, 150)
  recipientName: string;

  @ApiProperty({
    description: 'Assinatura manuscrita em data URL (png/jpeg), mesmo padrão do cadastro de morador',
  })
  @IsSignatureImage()
  signature: string;
}
