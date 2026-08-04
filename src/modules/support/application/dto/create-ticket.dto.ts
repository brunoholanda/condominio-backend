import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';

import { TicketCategory } from '../../domain/enums/ticket-category';

export class CreateTicketDto {
  @ApiProperty({ enum: TicketCategory, example: TicketCategory.Problem })
  @IsEnum(TicketCategory)
  category: TicketCategory;

  @ApiProperty({ example: 'Não consigo gerar o QR Code da página pública' })
  @IsString()
  @Length(5, 200)
  subject: string;

  @ApiProperty({
    example:
      'Ao clicar em baixar o PDF do QR Code, a tela fica em branco no Chrome do celular. Passos: abrir Página pública e tocar em Baixar.',
  })
  @IsString()
  @Length(10, 5000)
  body: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Condomínio relacionado, se houver' })
  @IsOptional()
  @IsUUID()
  condominiumId?: string;
}
