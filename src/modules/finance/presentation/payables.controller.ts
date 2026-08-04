import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { AccessTokenPayload } from '../../auth/application/ports/access-token-service';
import { CurrentUser } from '../../auth/infrastructure/http/current-user.decorator';
import { CondominiumAccessGuard } from '../../condominiums/infrastructure/http/condominium-access.guard';
import { MembershipRole } from '../../condominiums/domain/enums/membership-role';
import { RequireMembership } from '../../condominiums/infrastructure/http/require-membership.decorator';
import { ChangePayableStatusDto } from '../application/dto/change-payable-status.dto';
import { CreatePayableDto } from '../application/dto/create-payable.dto';
import { PayableFiltersQueryDto } from '../application/dto/payable-filters-query.dto';
import {
  PaginatedPayablesResponseDto,
  PayableResponseDto,
} from '../application/dto/payable-response.dto';
import { UpdatePayableDto } from '../application/dto/update-payable.dto';
import { CancelPayableUseCase } from '../application/use-cases/cancel-payable.use-case';
import { CreatePayableUseCase } from '../application/use-cases/create-payable.use-case';
import { GetPayableUseCase } from '../application/use-cases/get-payable.use-case';
import { ListPayablesUseCase } from '../application/use-cases/list-payables.use-case';
import { MarkPayableAsPaidUseCase } from '../application/use-cases/mark-payable-as-paid.use-case';
import { UpdatePayableUseCase } from '../application/use-cases/update-payable.use-case';

const MANAGEMENT_ROLES = [MembershipRole.Owner, MembershipRole.Manager];

/** Finance is restricted to whoever runs the condo: OPERATOR has no access here. */
@ApiTags('Financeiro')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...MANAGEMENT_ROLES)
@Controller('condominiums/:condominiumId/payables')
export class PayablesController {
  constructor(
    private readonly createPayable: CreatePayableUseCase,
    private readonly listPayables: ListPayablesUseCase,
    private readonly getPayable: GetPayableUseCase,
    private readonly updatePayable: UpdatePayableUseCase,
    private readonly markPayableAsPaid: MarkPayableAsPaidUseCase,
    private readonly cancelPayable: CancelPayableUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma conta a pagar' })
  @ApiResponse({ status: HttpStatus.CREATED, type: PayableResponseDto })
  create(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() body: CreatePayableDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<PayableResponseDto> {
    return this.createPayable.execute(body, condominiumId, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lista contas a pagar com filtros e paginação' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedPayablesResponseDto })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query() query: PayableFiltersQueryDto,
  ): Promise<PaginatedPayablesResponseDto> {
    return this.listPayables.execute(query, condominiumId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha uma conta a pagar' })
  @ApiResponse({ status: HttpStatus.OK, type: PayableResponseDto })
  findById(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PayableResponseDto> {
    return this.getPayable.execute(id, condominiumId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma conta a pagar pendente' })
  @ApiResponse({ status: HttpStatus.OK, type: PayableResponseDto })
  update(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatePayableDto,
  ): Promise<PayableResponseDto> {
    return this.updatePayable.execute(id, body, condominiumId);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Marca a conta como paga' })
  @ApiResponse({ status: HttpStatus.OK, type: PayableResponseDto })
  markAsPaid(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ChangePayableStatusDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<PayableResponseDto> {
    return this.markPayableAsPaid.execute(id, condominiumId, user.sub, body);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancela a conta a pagar' })
  @ApiResponse({ status: HttpStatus.OK, type: PayableResponseDto })
  cancel(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ChangePayableStatusDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<PayableResponseDto> {
    return this.cancelPayable.execute(id, condominiumId, user.sub, body);
  }
}
