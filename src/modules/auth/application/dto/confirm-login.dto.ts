import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Matches } from 'class-validator';

export class ConfirmLoginDto {
  @ApiProperty({ format: 'uuid', description: 'Devolvido pela primeira etapa do login' })
  @IsUUID()
  challengeId: string;

  @ApiProperty({ example: '123456', description: 'Código de 6 dígitos enviado por e-mail' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'O código deve ter 6 dígitos.' })
  code: string;
}
