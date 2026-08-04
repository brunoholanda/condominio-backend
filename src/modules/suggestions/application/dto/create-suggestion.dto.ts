import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsString, Length } from 'class-validator';

import { IsCpf } from '../../../../shared/application/validators/brazilian-formats.validator';

export class CreateSuggestionDto {
  @ApiProperty({ example: '101' })
  @IsString()
  @Length(1, 20)
  unitNumber: string;

  @ApiProperty({ example: '529.982.247-25' })
  @IsCpf()
  cpf: string;

  @ApiProperty({
    example:
      'Sugiro melhorar a iluminação do estacionamento noturno, com respeito e transparência junto à administração.',
  })
  @IsString()
  @Length(10, 4000)
  body: string;

  @ApiProperty({
    example: true,
    description: 'Confirma o compromisso com respeito e transparência na mensagem',
  })
  @Equals(true, {
    message: 'É necessário confirmar o compromisso com o respeito e a transparência.',
  })
  respectAndTransparencyCommitment: true;
}
