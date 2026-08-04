import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { TicketCategory } from '../../domain/enums/ticket-category';
import { TicketStatus } from '../../domain/enums/ticket-status';

export class SupportTicketResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ enum: TicketCategory })
  category: TicketCategory;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  body: string;

  @ApiProperty({ enum: TicketStatus })
  status: TicketStatus;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  condominiumId: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional({ description: 'Preenchido na listagem administrativa' })
  authorName?: string;

  @ApiPropertyOptional({ description: 'Preenchido na listagem administrativa' })
  authorEmail?: string;
}
