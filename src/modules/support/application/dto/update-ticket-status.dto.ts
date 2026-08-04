import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { TicketStatus } from '../../domain/enums/ticket-status';

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: TicketStatus, example: TicketStatus.InProgress })
  @IsEnum(TicketStatus)
  status: TicketStatus;
}
