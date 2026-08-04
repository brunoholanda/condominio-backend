import {
  Body,
  Controller,
  Get,
  HttpCode,
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
import { MembershipRole } from '../../condominiums/domain/enums/membership-role';
import { CondominiumAccessGuard } from '../../condominiums/infrastructure/http/condominium-access.guard';
import { RequireMembership } from '../../condominiums/infrastructure/http/require-membership.decorator';
import type {
  AsaasSettingsResponseDto,
  ChargeResponseDto,
  ChargeSummaryResponseDto,
  GenerateChargesResultDto,
  PaginatedChargesResponseDto,
} from '../application/dto/charge-response.dto';
import {
  CancelChargeDto,
  ChargeFiltersQueryDto,
  GenerateChargesDto,
  UpsertAsaasSettingsDto,
} from '../application/dto/receivables.dto';
import {
  GetAsaasSettingsUseCase,
  UpsertAsaasSettingsUseCase,
} from '../application/use-cases/asaas-settings.use-case';
import { CancelChargeUseCase } from '../application/use-cases/cancel-charge.use-case';
import { GenerateChargesUseCase } from '../application/use-cases/generate-charges.use-case';
import {
  GetChargeUseCase,
  ListChargesUseCase,
  SummarizeChargesUseCase,
} from '../application/use-cases/list-charges.use-case';
import { RemindPendingChargesUseCase } from '../application/use-cases/remind-pending-charges.use-case';

const MANAGEMENT_ROLES = [MembershipRole.Owner, MembershipRole.Manager];

@ApiTags('Cobranças')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...MANAGEMENT_ROLES)
@Controller('condominiums/:condominiumId')
export class ChargesController {
  constructor(
    private readonly generateCharges: GenerateChargesUseCase,
    private readonly listCharges: ListChargesUseCase,
    private readonly getCharge: GetChargeUseCase,
    private readonly summarizeCharges: SummarizeChargesUseCase,
    private readonly cancelCharge: CancelChargeUseCase,
    private readonly getAsaasSettings: GetAsaasSettingsUseCase,
    private readonly upsertAsaasSettings: UpsertAsaasSettingsUseCase,
    private readonly remindPending: RemindPendingChargesUseCase,
  ) {}

  @Get('charges/summary')
  @ApiOperation({ summary: 'Resumo das cobranças PIX do condomínio' })
  @ApiResponse({ status: HttpStatus.OK, type: Object })
  summary(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
  ): Promise<ChargeSummaryResponseDto> {
    return this.summarizeCharges.execute(condominiumId);
  }

  @Post('charges/remind-pending')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Notifica OWNER/MANAGER sobre cobranças pendentes vencidas ou a vencer',
  })
  remind(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
  ): Promise<{ notifiedUsers: number; pendingCharges: number }> {
    return this.remindPending.execute(condominiumId);
  }

  @Get('charges')
  @ApiOperation({ summary: 'Lista cobranças PIX' })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query() query: ChargeFiltersQueryDto,
  ): Promise<PaginatedChargesResponseDto> {
    return this.listCharges.execute(condominiumId, query);
  }

  @Get('charges/:id')
  @ApiOperation({ summary: 'Detalha uma cobrança PIX' })
  findById(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ChargeResponseDto> {
    return this.getCharge.execute(id, condominiumId);
  }

  @Post('charge-batches')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Gera cobranças PIX em lote para unidades' })
  generate(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() body: GenerateChargesDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<GenerateChargesResultDto> {
    return this.generateCharges.execute(condominiumId, user.sub, body);
  }

  @Post('charges/:id/cancel')
  @ApiOperation({ summary: 'Cancela uma cobrança PIX pendente' })
  cancel(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CancelChargeDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<ChargeResponseDto> {
    return this.cancelCharge.execute(id, condominiumId, user.sub, body);
  }

  @Get('asaas-settings')
  @ApiOperation({ summary: 'Consulta integração Asaas do condomínio' })
  getSettings(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
  ): Promise<AsaasSettingsResponseDto> {
    return this.getAsaasSettings.execute(condominiumId);
  }

  @Put('asaas-settings')
  @ApiOperation({ summary: 'Salva e valida a chave Asaas do condomínio' })
  putSettings(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() body: UpsertAsaasSettingsDto,
  ): Promise<AsaasSettingsResponseDto> {
    return this.upsertAsaasSettings.execute(condominiumId, body);
  }
}
