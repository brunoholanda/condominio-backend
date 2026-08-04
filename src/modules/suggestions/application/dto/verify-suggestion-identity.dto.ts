import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

import { IsCpf } from '../../../../shared/application/validators/brazilian-formats.validator';

export class VerifySuggestionIdentityDto {
  @ApiProperty({ example: '101' })
  @IsString()
  @Length(1, 20)
  unitNumber: string;

  @ApiProperty({ example: '529.982.247-25' })
  @IsCpf()
  cpf: string;
}

export class VerifySuggestionIdentityResponseDto {
  @ApiProperty({ example: true })
  valid: boolean;

  @ApiProperty({ example: '101' })
  unitNumber: string;

  @ApiProperty({
    example: 'C***s P***a',
    description: 'Nome parcialmente oculto do titular, só para confirmação visual',
  })
  authorNameHint: string;
}
