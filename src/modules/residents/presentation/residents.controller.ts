import {
  Body,
  Controller,
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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { AccessTokenPayload } from '../../auth/application/ports/access-token-service';
import { CurrentUser } from '../../auth/infrastructure/http/current-user.decorator';
import { Public } from '../../auth/infrastructure/http/public.decorator';
import { AuditAccess } from '../../../shared/infrastructure/http/audit-access.decorator';
import { CreateResidentDto } from '../application/dto/create-resident.dto';
import { ListResidentsQueryDto } from '../application/dto/list-residents-query.dto';
import { ResidentFiltersQueryDto } from '../application/dto/resident-filters-query.dto';
import {
  PaginatedResidentsResponseDto,
  ResidentResponseDto,
} from '../application/dto/resident-response.dto';
import { ResidentsSummaryDto } from '../application/dto/residents-summary.dto';
import { UpdateResidentDto } from '../application/dto/update-resident.dto';
import { CreateResidentUseCase } from '../application/use-cases/create-resident.use-case';
import { DeleteResidentUseCase } from '../application/use-cases/delete-resident.use-case';
import { FindResidentByIdUseCase } from '../application/use-cases/find-resident-by-id.use-case';
import { GenerateResidentsReportUseCase } from '../application/use-cases/generate-residents-report.use-case';
import { GetResidentsSummaryUseCase } from '../application/use-cases/get-residents-summary.use-case';
import { ListResidentsUseCase } from '../application/use-cases/list-residents.use-case';
import { UpdateResidentUseCase } from '../application/use-cases/update-resident.use-case';

/**
 * Sending the form is open to anyone (it is filled by the resident), while
 * consulting the registrations requires an authenticated account.
 */
@ApiTags('Moradores')
@ApiBearerAuth()
@Controller('residents')
export class ResidentsController {
  constructor(
    private readonly createResident: CreateResidentUseCase,
    private readonly listResidents: ListResidentsUseCase,
    private readonly summarizeResidents: GetResidentsSummaryUseCase,
    private readonly generateReport: GenerateResidentsReportUseCase,
    private readonly findResident: FindResidentByIdUseCase,
    private readonly updateResident: UpdateResidentUseCase,
    private readonly deleteResident: DeleteResidentUseCase,
  ) {}

  @Public()
  @Post()
  @AuditAccess('enviou um cadastro pelo formulário público')
  @ApiOperation({ summary: 'Cadastra um morador (aberto ao público)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ResidentResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'CPF ou unidade já cadastrados' })
  create(@Body() body: CreateResidentDto): Promise<ResidentResponseDto> {
    return this.createResident.execute(body);
  }

  @Get()
  @AuditAccess('consultou a lista de moradores')
  @ApiOperation({ summary: 'Lista moradores com filtros e paginação' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedResidentsResponseDto })
  list(@Query() query: ListResidentsQueryDto): Promise<PaginatedResidentsResponseDto> {
    return this.listResidents.execute(query);
  }

  /** Declared before `:id` so the fixed path is not read as an identifier. */
  @Get('summary')
  @ApiOperation({ summary: 'Resume a adesão do condomínio ao cadastro' })
  @ApiResponse({ status: HttpStatus.OK, type: ResidentsSummaryDto })
  summary(): Promise<ResidentsSummaryDto> {
    return this.summarizeResidents.execute();
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
    @Query() query: ResidentFiltersQueryDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<StreamableFile> {
    const { fileName, content } = await this.generateReport.execute(query, user.email);

    return new StreamableFile(content, {
      type: 'application/pdf',
      disposition: `attachment; filename="${fileName}"`,
    });
  }

  @Get(':id')
  @AuditAccess('abriu o cadastro completo')
  @ApiOperation({ summary: 'Detalha um morador' })
  @ApiResponse({ status: HttpStatus.OK, type: ResidentResponseDto })
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<ResidentResponseDto> {
    return this.findResident.execute(id);
  }

  @Put(':id')
  @AuditAccess('alterou o cadastro')
  @ApiOperation({ summary: 'Substitui os dados de um morador' })
  @ApiResponse({ status: HttpStatus.OK, type: ResidentResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateResidentDto,
  ): Promise<ResidentResponseDto> {
    return this.updateResident.execute(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuditAccess('removeu o cadastro')
  @ApiOperation({ summary: 'Remove um morador e seus dados vinculados' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteResident.execute(id);
  }
}
