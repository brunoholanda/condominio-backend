import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '../../domain/password-policy';

export class LoginDto {
  @ApiProperty({ example: 'sindico@portoimperial.com.br' })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;

  @ApiProperty({ example: '********' })
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`,
  })
  @MaxLength(MAX_PASSWORD_LENGTH)
  password: string;
}
