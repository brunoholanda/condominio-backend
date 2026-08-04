import { ApiProperty } from '@nestjs/swagger';

export class SigningSessionResponseDto {
  @ApiProperty({ description: 'Token opaco que identifica a sessão de assinatura' })
  token: string;

  @ApiProperty()
  expiresAt: string;

  @ApiProperty({ description: 'Link que o QR Code aponta, para abrir manualmente se preciso' })
  signUrl: string;

  @ApiProperty({ description: 'QR Code do link de assinatura, em data URL (PNG)' })
  qrPngDataUrl: string;
}
