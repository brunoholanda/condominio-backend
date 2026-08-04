import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CondominiumAccessGuard } from '../../condominiums/infrastructure/http/condominium-access.guard';
import { MembershipRole } from '../../condominiums/domain/enums/membership-role';
import { RequireMembership } from '../../condominiums/infrastructure/http/require-membership.decorator';
import { CreateEmployeeDto } from '../application/dto/create-employee.dto';
import {
  EmployeeListItemDto,
  EmployeeResponseDto,
} from '../application/dto/employee-response.dto';
import { ListPunchesQueryDto } from '../application/dto/staff-auth.dto';
import { TimePunchResponseDto } from '../application/dto/time-punch-response.dto';
import { UpdateEmployeeDto } from '../application/dto/update-employee.dto';
import {
  CreateEmployeeUseCase,
  DeleteEmployeeUseCase,
  GetEmployeeUseCase,
  ListEmployeesUseCase,
  UpdateEmployeeUseCase,
} from '../application/use-cases/employee-crud.use-case';
import {
  DownloadPunchSelfieUseCase,
  ExportPunchesCsvUseCase,
  ListPunchesUseCase,
  PurgeOldPunchSelfiesUseCase,
} from '../application/use-cases/punch.use-case';

const MANAGEMENT_ROLES = [MembershipRole.Owner, MembershipRole.Manager];

@ApiTags('Funcionários')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...MANAGEMENT_ROLES)
@Controller('condominiums/:condominiumId/employees')
export class EmployeesController {
  constructor(
    private readonly createEmployee: CreateEmployeeUseCase,
    private readonly listEmployees: ListEmployeesUseCase,
    private readonly getEmployee: GetEmployeeUseCase,
    private readonly updateEmployee: UpdateEmployeeUseCase,
    private readonly deleteEmployee: DeleteEmployeeUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra funcionário do condomínio' })
  @ApiResponse({ status: HttpStatus.CREATED, type: EmployeeResponseDto })
  create(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() body: CreateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    return this.createEmployee.execute(condominiumId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Lista funcionários' })
  @ApiResponse({ status: HttpStatus.OK, type: [EmployeeListItemDto] })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
  ): Promise<EmployeeListItemDto[]> {
    return this.listEmployees.execute(condominiumId);
  }

  @Get(':employeeId')
  @ApiOperation({ summary: 'Detalha funcionário' })
  @ApiResponse({ status: HttpStatus.OK, type: EmployeeResponseDto })
  get(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ): Promise<EmployeeResponseDto> {
    return this.getEmployee.execute(condominiumId, employeeId);
  }

  @Put(':employeeId')
  @ApiOperation({ summary: 'Atualiza ficha do funcionário' })
  @ApiResponse({ status: HttpStatus.OK, type: EmployeeResponseDto })
  update(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() body: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    return this.updateEmployee.execute(condominiumId, employeeId, body);
  }

  @Delete(':employeeId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove funcionário' })
  async remove(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ): Promise<void> {
    await this.deleteEmployee.execute(condominiumId, employeeId);
  }
}

@ApiTags('Ponto eletrônico')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...MANAGEMENT_ROLES)
@Controller('condominiums/:condominiumId/punches')
export class PunchesAdminController {
  constructor(
    private readonly listPunches: ListPunchesUseCase,
    private readonly downloadSelfie: DownloadPunchSelfieUseCase,
    private readonly exportCsv: ExportPunchesCsvUseCase,
    private readonly purgeSelfies: PurgeOldPunchSelfiesUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista marcações de ponto do condomínio' })
  @ApiResponse({ status: HttpStatus.OK, type: [TimePunchResponseDto] })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query() query: ListPunchesQueryDto,
  ): Promise<TimePunchResponseDto[]> {
    return this.listPunches.execute(condominiumId, query);
  }

  @Get('export.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @ApiOperation({ summary: 'Exporta marcações de ponto em CSV' })
  async export(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query() query: ListPunchesQueryDto,
  ): Promise<StreamableFile> {
    const file = await this.exportCsv.execute(condominiumId, query);

    return new StreamableFile(Buffer.from(file.csv, 'utf8'), {
      type: 'text/csv; charset=utf-8',
      disposition: `attachment; filename="${file.fileName}"`,
    });
  }

  @Post('purge-selfies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove selfies de ponto além do prazo de retenção (R2 + metadado)',
  })
  purge(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
  ): Promise<{ purged: number }> {
    return this.purgeSelfies.execute(condominiumId);
  }

  @Get(':punchId/selfie')
  @Header('Content-Type', 'image/jpeg')
  @ApiOperation({ summary: 'Baixa selfie da marcação' })
  async selfie(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('punchId', ParseUUIDPipe) punchId: string,
  ): Promise<StreamableFile> {
    const file = await this.downloadSelfie.execute(condominiumId, punchId);

    return new StreamableFile(file.buffer, {
      type: 'image/jpeg',
      disposition: `inline; filename="${file.fileName}"`,
    });
  }
}
