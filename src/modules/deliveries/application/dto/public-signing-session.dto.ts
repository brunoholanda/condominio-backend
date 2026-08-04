import { ApiProperty } from '@nestjs/swagger';

/** O que quem vai assinar no celular precisa ver antes de confirmar a retirada. */
export class PublicSigningSessionDto {
  @ApiProperty()
  condominiumName: string;

  @ApiProperty()
  unitNumber: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  expiresAt: string;
}

export class CompletePublicSigningResponseDto {
  @ApiProperty()
  deliveredAt: string;
}
