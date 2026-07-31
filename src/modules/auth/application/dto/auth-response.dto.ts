import { ApiProperty } from '@nestjs/swagger';

export class AuthenticatedUserDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT a ser enviado no cabeçalho Authorization' })
  accessToken: string;

  @ApiProperty({ description: 'Validade do token, em segundos' })
  expiresIn: number;

  @ApiProperty({ type: AuthenticatedUserDto })
  user: AuthenticatedUserDto;
}
