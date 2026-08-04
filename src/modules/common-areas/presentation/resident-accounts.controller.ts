import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CondominiumAccessGuard } from '../../condominiums/infrastructure/http/condominium-access.guard';
import { MembershipRole } from '../../condominiums/domain/enums/membership-role';
import { RequireMembership } from '../../condominiums/infrastructure/http/require-membership.decorator';
import { CreateResidentAccountDto } from '../application/dto/create-resident-account.dto';
import { ResidentAccountResponseDto } from '../application/dto/resident-account-response.dto';
import { CreateResidentAccountUseCase } from '../application/use-cases/create-resident-account.use-case';
import { ListResidentAccountsUseCase } from '../application/use-cases/list-resident-accounts.use-case';

const MANAGEMENT_ROLES = [MembershipRole.Owner, MembershipRole.Manager];

@ApiTags('Contas de moradores')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...MANAGEMENT_ROLES)
@Controller('condominiums/:condominiumId/resident-accounts')
export class ResidentAccountsController {
  constructor(
    private readonly createResidentAccount: CreateResidentAccountUseCase,
    private readonly listResidentAccounts: ListResidentAccountsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Vincula uma conta já cadastrada a uma unidade' })
  @ApiResponse({ status: 201, type: ResidentAccountResponseDto })
  create(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() body: CreateResidentAccountDto,
  ): Promise<ResidentAccountResponseDto> {
    return this.createResidentAccount.execute(body, condominiumId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista as contas de moradores vinculadas' })
  @ApiResponse({ status: 200, type: [ResidentAccountResponseDto] })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
  ): Promise<ResidentAccountResponseDto[]> {
    return this.listResidentAccounts.execute(condominiumId);
  }
}
