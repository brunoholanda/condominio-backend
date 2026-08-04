import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { AccessTokenPayload } from '../../auth/application/ports/access-token-service';
import { CurrentUser } from '../../auth/infrastructure/http/current-user.decorator';
import { CreateTicketDto } from '../application/dto/create-ticket.dto';
import { SupportTicketResponseDto } from '../application/dto/support-ticket-response.dto';
import { CreateTicketUseCase } from '../application/use-cases/create-ticket.use-case';
import { ListMyTicketsUseCase } from '../application/use-cases/list-my-tickets.use-case';

@ApiTags('Suporte')
@ApiBearerAuth()
@Controller('support/tickets')
export class SupportTicketsController {
  constructor(
    private readonly createTicket: CreateTicketUseCase,
    private readonly listMyTickets: ListMyTicketsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Abre um chamado de problema ou melhoria' })
  @ApiResponse({ status: 201, type: SupportTicketResponseDto })
  create(
    @CurrentUser() actor: AccessTokenPayload,
    @Body() body: CreateTicketDto,
  ): Promise<SupportTicketResponseDto> {
    return this.createTicket.execute(actor, body);
  }

  @Get('mine')
  @ApiOperation({ summary: 'Lista os chamados abertos pelo usuário autenticado' })
  @ApiResponse({ status: 200, type: [SupportTicketResponseDto] })
  mine(@CurrentUser() actor: AccessTokenPayload): Promise<SupportTicketResponseDto[]> {
    return this.listMyTickets.execute(actor.sub);
  }
}
