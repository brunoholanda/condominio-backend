import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { AccessTokenPayload } from '../../auth/application/ports/access-token-service';
import { CurrentUser } from '../../auth/infrastructure/http/current-user.decorator';
import { MembershipRole } from '../../condominiums/domain/enums/membership-role';
import { CondominiumAccessGuard } from '../../condominiums/infrastructure/http/condominium-access.guard';
import { RequireMembership } from '../../condominiums/infrastructure/http/require-membership.decorator';
import {
  CreateWorkOrderDto,
  ListWorkOrdersQueryDto,
  UpdateWorkOrderStatusDto,
  WorkOrderResponseDto,
} from '../application/dto/work-order.dto';
import {
  CreateWorkOrderUseCase,
  ListWorkOrdersUseCase,
  UpdateWorkOrderStatusUseCase,
} from '../application/use-cases/work-order.use-case';

const OPS_ROLES = [
  MembershipRole.Owner,
  MembershipRole.Manager,
  MembershipRole.Operator,
];

@ApiTags('Chamados do condomínio')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...OPS_ROLES)
@Controller('condominiums/:condominiumId/work-orders')
export class WorkOrdersController {
  constructor(
    private readonly createOrder: CreateWorkOrderUseCase,
    private readonly listOrders: ListWorkOrdersUseCase,
    private readonly updateStatus: UpdateWorkOrderStatusUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Abre um chamado do condomínio' })
  @ApiResponse({ status: HttpStatus.CREATED, type: WorkOrderResponseDto })
  create(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @CurrentUser() user: AccessTokenPayload,
    @Body() body: CreateWorkOrderDto,
  ): Promise<WorkOrderResponseDto> {
    return this.createOrder.execute(condominiumId, user.sub, body);
  }

  @Get()
  @ApiOperation({ summary: 'Lista chamados do condomínio' })
  @ApiResponse({ status: HttpStatus.OK, type: [WorkOrderResponseDto] })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query() query: ListWorkOrdersQueryDto,
  ): Promise<WorkOrderResponseDto[]> {
    return this.listOrders.execute(condominiumId, query);
  }

  @Patch(':orderId/status')
  @ApiOperation({ summary: 'Atualiza status do chamado' })
  @ApiResponse({ status: HttpStatus.OK, type: WorkOrderResponseDto })
  patchStatus(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() body: UpdateWorkOrderStatusDto,
  ): Promise<WorkOrderResponseDto> {
    return this.updateStatus.execute(condominiumId, orderId, body);
  }
}
