import { ApiProperty } from '@nestjs/swagger';

import { IsCpf } from '../../../../shared/application/validators/brazilian-formats.validator';

export class IdentifyOperatorDto {
  @ApiProperty({
    example: '390.533.447-05',
    description: 'CPF de quem opera a área restrita, para fins de responsabilização',
  })
  @IsCpf()
  cpf: string;
}
