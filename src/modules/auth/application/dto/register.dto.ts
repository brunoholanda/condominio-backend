import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '../../domain/password-policy';
import { SubscriptionPlan } from '../../domain/enums/subscription-plan';

export class RegisterDto {
  @ApiProperty({ example: 'Maria Souza' })
  @IsString()
  @Length(3, 150)
  name: string;

  @ApiProperty({ example: 'maria@exemplo.com.br' })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;

  @ApiProperty({ example: '********' })
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`,
  })
  @MaxLength(MAX_PASSWORD_LENGTH)
  password: string;

  @ApiPropertyOptional({
    enum: SubscriptionPlan,
    description: 'Plano escolhido na landing; padrão Lite',
  })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;
}
