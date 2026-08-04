import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { AccessTokenPayload } from '../../auth/application/ports/access-token-service';
import { CurrentUser } from '../../auth/infrastructure/http/current-user.decorator';
import type { CondominiumResponseDto } from '../../condominiums/application/dto/condominium-response.dto';
import { PlatformAccountDto } from '../application/dto/platform-account.dto';
import { SetAccountActiveDto } from '../application/dto/set-account-active.dto';
import { SetPlatformRoleDto } from '../application/dto/set-platform-role.dto';
import { UpdateAccountSubscriptionDto } from '../application/dto/update-account-subscription.dto';
import { ListAllCondominiumsUseCase } from '../application/use-cases/list-all-condominiums.use-case';
import { ListPlatformAccountsUseCase } from '../application/use-cases/list-platform-accounts.use-case';
import { SetAccountActiveUseCase } from '../application/use-cases/set-account-active.use-case';
import { SetPlatformRoleUseCase } from '../application/use-cases/set-platform-role.use-case';
import { UpdateAccountSubscriptionUseCase } from '../application/use-cases/update-account-subscription.use-case';
import { RequireSystemOwner } from '../infrastructure/http/require-system-owner.decorator';
import { SystemOwnerGuard } from '../infrastructure/http/system-owner.guard';

@ApiTags('Administração da plataforma')
@ApiBearerAuth()
@UseGuards(SystemOwnerGuard)
@RequireSystemOwner()
@Controller('admin')
export class PlatformAdminController {
  constructor(
    private readonly listAccounts: ListPlatformAccountsUseCase,
    private readonly setAccountActive: SetAccountActiveUseCase,
    private readonly setPlatformRole: SetPlatformRoleUseCase,
    private readonly updateSubscription: UpdateAccountSubscriptionUseCase,
    private readonly listCondominiums: ListAllCondominiumsUseCase,
  ) {}

  @Get('accounts')
  @ApiOperation({ summary: 'Lista todas as contas cadastradas na plataforma' })
  @ApiResponse({ status: 200, type: [PlatformAccountDto] })
  accounts(): Promise<PlatformAccountDto[]> {
    return this.listAccounts.execute();
  }

  @Put('accounts/:id/active')
  @ApiOperation({ summary: 'Ativa ou desativa uma conta da plataforma' })
  @ApiResponse({ status: 200, type: PlatformAccountDto })
  setActive(
    @CurrentUser() actor: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SetAccountActiveDto,
  ): Promise<PlatformAccountDto> {
    return this.setAccountActive.execute(actor.sub, id, body.active);
  }

  @Put('accounts/:id/platform-role')
  @ApiOperation({ summary: 'Define ou remove o papel de dono do sistema' })
  @ApiResponse({ status: 200, type: PlatformAccountDto })
  setRole(
    @CurrentUser() actor: AccessTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SetPlatformRoleDto,
  ): Promise<PlatformAccountDto> {
    return this.setPlatformRole.execute(actor.sub, id, body.platformRole ?? null);
  }

  @Patch('accounts/:id/subscription')
  @ApiOperation({ summary: 'Atualiza plano e/ou status de assinatura da conta' })
  @ApiResponse({ status: 200, type: PlatformAccountDto })
  setSubscription(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAccountSubscriptionDto,
  ): Promise<PlatformAccountDto> {
    return this.updateSubscription.execute(id, body);
  }

  @Get('condominiums')
  @ApiOperation({ summary: 'Lista todos os condomínios da plataforma' })
  @ApiResponse({ status: 200 })
  condominiums(): Promise<CondominiumResponseDto[]> {
    return this.listCondominiums.execute();
  }
}
