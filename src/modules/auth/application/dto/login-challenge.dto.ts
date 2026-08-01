import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

/** Primeira etapa concluída: falta digitar o código que foi para o e-mail. */
export class LoginChallengeDto {
  @ApiProperty({ format: 'uuid', description: 'Identifica a tentativa de login em andamento' })
  challengeId: string;

  @ApiProperty({
    example: 'ho****es@exemplo.com.br',
    description: 'E-mail parcialmente oculto, só para a pessoa reconhecer a caixa',
  })
  email: string;

  @ApiProperty({ description: 'Segundos restantes de validade do código' })
  expiresInSeconds: number;
}

export class ResendLoginCodeDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  challengeId: string;
}
