import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

import { AuditAccess } from '../../../shared/infrastructure/http/audit-access.decorator';
import { MANAGEMENT_ROLES } from '../../condominiums/domain/enums/membership-role';
import { CondominiumAccessGuard } from '../../condominiums/infrastructure/http/condominium-access.guard';
import { RequireMembership } from '../../condominiums/infrastructure/http/require-membership.decorator';
import {
  FormerResidentDetailDto,
  FormerResidentListItemDto,
} from '../application/dto/former-resident-response.dto';
import {
  FindFormerResidentByIdUseCase,
  ListFormerResidentsUseCase,
} from '../application/use-cases/former-resident-queries.use-case';

class ListFormerResidentsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  unit?: string;
}

@ApiTags('Moradores (histórico LGPD)')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...MANAGEMENT_ROLES)
@Controller('condominiums/:condominiumId/former-residents')
export class FormerResidentsController {
  constructor(
    private readonly listFormer: ListFormerResidentsUseCase,
    private readonly findFormer: FindFormerResidentByIdUseCase,
  ) {}

  @Get()
  @AuditAccess('consultou o histórico de moradores')
  @ApiOperation({ summary: 'Lista cadastros arquivados (retenção LGPD)' })
  @ApiQuery({ name: 'unit', required: false })
  @ApiResponse({ status: 200, type: [FormerResidentListItemDto] })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query() query: ListFormerResidentsQueryDto,
  ): Promise<FormerResidentListItemDto[]> {
    return this.listFormer.execute(condominiumId, query.unit);
  }

  @Get(':recordId')
  @AuditAccess('abriu o detalhe de morador arquivado')
  @ApiOperation({ summary: 'Detalha um cadastro arquivado' })
  @ApiResponse({ status: 200, type: FormerResidentDetailDto })
  findById(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('recordId', ParseUUIDPipe) recordId: string,
  ): Promise<FormerResidentDetailDto> {
    return this.findFormer.execute(recordId, condominiumId);
  }
}
