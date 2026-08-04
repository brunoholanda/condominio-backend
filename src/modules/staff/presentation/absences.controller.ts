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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import type { AccessTokenPayload } from '../../auth/application/ports/access-token-service';
import { CurrentUser } from '../../auth/infrastructure/http/current-user.decorator';
import { CondominiumAccessGuard } from '../../condominiums/infrastructure/http/condominium-access.guard';
import { MembershipRole } from '../../condominiums/domain/enums/membership-role';
import { RequireMembership } from '../../condominiums/infrastructure/http/require-membership.decorator';
import {
  AbsenceResponseDto,
  CreateAbsenceDto,
  ListAbsencesQueryDto,
  ReviewAbsenceDto,
  UpdateAbsenceDto,
} from '../application/dto/absence.dto';
import {
  CreateAbsenceUseCase,
  DeleteAbsenceUseCase,
  ListAbsencesUseCase,
  ReviewAbsenceUseCase,
  UpdateAbsenceUseCase,
  UploadAbsenceAttachmentUseCase,
} from '../application/use-cases/absence.use-case';

const MANAGEMENT_ROLES = [MembershipRole.Owner, MembershipRole.Manager];

@ApiTags('Faltas e justificativas')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...MANAGEMENT_ROLES)
@Controller('condominiums/:condominiumId/absences')
export class AbsencesController {
  constructor(
    private readonly createAbsence: CreateAbsenceUseCase,
    private readonly listAbsences: ListAbsencesUseCase,
    private readonly updateAbsence: UpdateAbsenceUseCase,
    private readonly deleteAbsence: DeleteAbsenceUseCase,
    private readonly reviewAbsence: ReviewAbsenceUseCase,
    private readonly uploadAttachment: UploadAbsenceAttachmentUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registra justificativa de falta/ausência' })
  @ApiResponse({ status: HttpStatus.CREATED, type: AbsenceResponseDto })
  create(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @CurrentUser() user: AccessTokenPayload,
    @Body() body: CreateAbsenceDto,
  ): Promise<AbsenceResponseDto> {
    return this.createAbsence.execute(condominiumId, user.sub, body);
  }

  @Get()
  @ApiOperation({ summary: 'Lista justificativas de falta' })
  @ApiResponse({ status: HttpStatus.OK, type: [AbsenceResponseDto] })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query() query: ListAbsencesQueryDto,
  ): Promise<AbsenceResponseDto[]> {
    return this.listAbsences.execute(condominiumId, query);
  }

  @Put(':absenceId')
  @ApiOperation({ summary: 'Atualiza justificativa de falta' })
  @ApiResponse({ status: HttpStatus.OK, type: AbsenceResponseDto })
  update(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('absenceId', ParseUUIDPipe) absenceId: string,
    @Body() body: UpdateAbsenceDto,
  ): Promise<AbsenceResponseDto> {
    return this.updateAbsence.execute(condominiumId, absenceId, body);
  }

  @Post(':absenceId/review')
  @ApiOperation({ summary: 'Aprova ou rejeita justificativa de falta' })
  @ApiResponse({ status: HttpStatus.OK, type: AbsenceResponseDto })
  review(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('absenceId', ParseUUIDPipe) absenceId: string,
    @CurrentUser() user: AccessTokenPayload,
    @Body() body: ReviewAbsenceDto,
  ): Promise<AbsenceResponseDto> {
    return this.reviewAbsence.execute(condominiumId, absenceId, user.sub, body);
  }

  @Post(':absenceId/attachment')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Anexa atestado/documento à justificativa' })
  @ApiResponse({ status: HttpStatus.OK, type: AbsenceResponseDto })
  upload(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('absenceId', ParseUUIDPipe) absenceId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<AbsenceResponseDto> {
    return this.uploadAttachment.execute(condominiumId, absenceId, file);
  }

  @Delete(':absenceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove justificativa de falta' })
  async remove(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('absenceId', ParseUUIDPipe) absenceId: string,
  ): Promise<void> {
    await this.deleteAbsence.execute(condominiumId, absenceId);
  }
}
