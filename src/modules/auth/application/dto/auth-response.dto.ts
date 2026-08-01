import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthenticatedUserDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Somente dígitos. Nulo enquanto o operador não se identifica.',
  })
  cpf: string | null;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT a ser enviado no cabeçalho Authorization' })
  accessToken: string;

  @ApiProperty({ description: 'Validade do token, em segundos' })
  expiresIn: number;

  @ApiProperty({ type: AuthenticatedUserDto })
  user: AuthenticatedUserDto;
}
