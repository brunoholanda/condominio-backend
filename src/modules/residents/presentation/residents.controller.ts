import {
  Controller,
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { AccessTokenPayload } from '../../auth/application/ports/access-token-service';
import { CurrentUser } from '../../auth/infrastructure/http/current-user.decorator';
import { AuditAccess } from '../../../shared/infrastructure/http/audit-access.decorator';
import { CondominiumAccessGuard } from '../../condominiums/infrastructure/http/condominium-access.guard';
import { MembershipRole } from '../../condominiums/domain/enums/membership-role';
import { RequireMembership } from '../../condominiums/infrastructure/http/require-membership.decorator';
import { ListResidentsQueryDto } from '../application/dto/list-residents-query.dto';
import { ResidentFiltersQueryDto } from '../application/dto/resident-filters-query.dto';
import {
  PaginatedResidentsResponseDto,
  ResidentResponseDto,
} from '../application/dto/resident-response.dto';
import { ResidentsSummaryDto } from '../application/dto/residents-summary.dto';
import { SetUnitVacancyDto } from '../application/dto/set-unit-vacancy.dto';
import { UpdateResidentDto } from '../application/dto/update-resident.dto';
import { DeleteResidentUseCase } from '../application/use-cases/delete-resident.use-case';
import { FindResidentByIdUseCase } from '../application/use-cases/find-resident-by-id.use-case';
import { GenerateResidentsReportUseCase } from '../application/use-cases/generate-residents-report.use-case';
import { GetResidentsSummaryUseCase } from '../application/use-cases/get-residents-summary.use-case';
import { ListResidentsUseCase } from '../application/use-cases/list-residents.use-case';
import { SetUnitVacancyUseCase } from '../application/use-cases/set-unit-vacancy.use-case';
import { UpdateResidentUseCase } from '../application/use-cases/update-resident.use-case';

const RESIDENTS_ROLES = [MembershipRole.Owner, MembershipRole.Manager, MembershipRole.Operator];

/**
 * Consulting or maintaining the registrations already collected requires a
 * membership in the condo (OPERATOR or above). Sending the form itself is
 * public and lives in `PublicCondoResidentsController`.
 */
@ApiTags('Moradores')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...RESIDENTS_ROLES)
@Controller('condominiums/:condominiumId/residents')
export class ResidentsController {
  constructor(
    private readonly listResidents: ListResidentsUseCase,
    private readonly summarizeResidents: GetResidentsSummaryUseCase,
    private readonly generateReport: GenerateResidentsReportUseCase,
    private readonly findResident: FindResidentByIdUseCase,
    private readonly updateResident: UpdateResidentUseCase,
    private readonly deleteResident: DeleteResidentUseCase,
    private readonly setUnitVacancy: SetUnitVacancyUseCase,
  ) {}

  @Get()
  @AuditAccess('consultou a lista de moradores')
  @ApiOperation({ summary: 'Lista moradores com filtros e paginação' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedResidentsResponseDto })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query() query: ListResidentsQueryDto,
  ): Promise<PaginatedResidentsResponseDto> {
    return this.listResidents.execute(query, condominiumId);
  }

  /** Declared before `:id` so the fixed path is not read as an identifier. */
  @Get('summary')
  @ApiOperation({ summary: 'Resume a adesão do condomínio ao cadastro' })
  @ApiResponse({ status: HttpStatus.OK, type: ResidentsSummaryDto })
  summary(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
  ): Promise<ResidentsSummaryDto> {
    return this.summarizeResidents.execute(condominiumId);
  }

  @Post('units/vacancy')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuditAccess('sinalizou unidade desocupada')
  @ApiOperation({
    summary: 'Marca ou remove a sinalização de unidade desocupada',
  })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  setVacancy(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() body: SetUnitVacancyDto,
  ): Promise<void> {
    return this.setUnitVacancy.execute(condominiumId, body);
  }

  @Get('report')
  @AuditAccess('exportou o PDF dos cadastros')
  @ApiOperation({ summary: 'Gera um PDF com uma página por morador cadastrado' })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Documento com os dados e a assinatura de cada morador',
    content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Nenhum morador para os filtros' })
  async report(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query() query: ResidentFiltersQueryDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<StreamableFile> {
    const { fileName, content } = await this.generateReport.execute(
      query,
      condominiumId,
      user.email,
    );

    return new StreamableFile(content, {
      type: 'application/pdf',
      disposition: `attachment; filename="${fileName}"`,
    });
  }

  @Get(':id')
  @AuditAccess('abriu o cadastro completo')
  @ApiOperation({ summary: 'Detalha um morador' })
  @ApiResponse({ status: HttpStatus.OK, type: ResidentResponseDto })
  findById(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResidentResponseDto> {
    return this.findResident.execute(id, condominiumId);
  }

  @Put(':id')
  @AuditAccess('alterou o cadastro')
  @ApiOperation({ summary: 'Substitui os dados de um morador' })
  @ApiResponse({ status: HttpStatus.OK, type: ResidentResponseDto })
  update(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateResidentDto,
  ): Promise<ResidentResponseDto> {
    return this.updateResident.execute(id, body, condominiumId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuditAccess('removeu o cadastro')
  @ApiOperation({ summary: 'Remove um morador e seus dados vinculados' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  remove(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.deleteResident.execute(id, condominiumId);
  }
}
