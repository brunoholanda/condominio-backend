import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';

import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '../../../auth/domain/password-policy';
import { MembershipRole } from '../../domain/enums/membership-role';

/**
 * Adds someone to the condo team.
 *
 * - If the e-mail already has an account, only the role is needed.
 * - If it is a new person, name + password create the platform account and then the link.
 */
export class AddMembershipDto {
  @ApiProperty({ example: 'operador@exemplo.com.br' })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;

  @ApiProperty({ enum: MembershipRole, example: MembershipRole.Operator })
  @IsEnum(MembershipRole)
  role: MembershipRole;

  @ApiPropertyOptional({
    example: 'Ana Oliveira',
    description: 'Obrigatório quando o e-mail ainda não tem conta na plataforma',
  })
  @IsOptional()
  @IsString()
  @Length(3, 150)
  name?: string;

  @ApiPropertyOptional({
    example: '********',
    description: 'Obrigatório quando o e-mail ainda não tem conta na plataforma',
  })
  @IsOptional()
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`,
  })
  @MaxLength(MAX_PASSWORD_LENGTH)
  password?: string;
}
