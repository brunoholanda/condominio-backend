import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { RequireSystemOwner } from '../../platform-admin/infrastructure/http/require-system-owner.decorator';
import { SystemOwnerGuard } from '../../platform-admin/infrastructure/http/system-owner.guard';
import { SupportTicketResponseDto } from '../application/dto/support-ticket-response.dto';
import { UpdateTicketStatusDto } from '../application/dto/update-ticket-status.dto';
import { ListAllTicketsUseCase } from '../application/use-cases/list-all-tickets.use-case';
import { UpdateTicketStatusUseCase } from '../application/use-cases/update-ticket-status.use-case';
import { TicketCategory } from '../domain/enums/ticket-category';
import { TicketStatus } from '../domain/enums/ticket-status';

class ListTicketsQueryDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;
}

@ApiTags('Administração da plataforma')
@ApiBearerAuth()
@UseGuards(SystemOwnerGuard)
@RequireSystemOwner()
@Controller('admin/support/tickets')
export class AdminSupportTicketsController {
  constructor(
    private readonly listAllTickets: ListAllTicketsUseCase,
    private readonly updateTicketStatus: UpdateTicketStatusUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os chamados da plataforma' })
  @ApiQuery({ name: 'status', required: false, enum: TicketStatus })
  @ApiQuery({ name: 'category', required: false, enum: TicketCategory })
  @ApiResponse({ status: 200, type: [SupportTicketResponseDto] })
  list(@Query() query: ListTicketsQueryDto): Promise<SupportTicketResponseDto[]> {
    return this.listAllTickets.execute({
      status: query.status,
      category: query.category,
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualiza o status de um chamado' })
  @ApiResponse({ status: 200, type: SupportTicketResponseDto })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTicketStatusDto,
  ): Promise<SupportTicketResponseDto> {
    return this.updateTicketStatus.execute(id, body.status);
  }
}
