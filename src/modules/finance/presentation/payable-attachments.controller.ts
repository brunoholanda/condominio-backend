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
  StreamableFile,
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
import { AttachmentResponseDto } from '../application/dto/attachment-response.dto';
import { UploadAttachmentDto } from '../application/dto/upload-attachment.dto';
import { AddAttachmentUseCase } from '../application/use-cases/add-attachment.use-case';
import { DeleteAttachmentUseCase } from '../application/use-cases/delete-attachment.use-case';
import { DownloadAttachmentUseCase } from '../application/use-cases/download-attachment.use-case';
import { ListAttachmentsUseCase } from '../application/use-cases/list-attachments.use-case';

const MANAGEMENT_ROLES = [MembershipRole.Owner, MembershipRole.Manager];

@ApiTags('Financeiro (anexos)')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...MANAGEMENT_ROLES)
@Controller('condominiums/:condominiumId/payables/:id/attachments')
export class PayableAttachmentsController {
  constructor(
    private readonly addAttachment: AddAttachmentUseCase,
    private readonly listAttachments: ListAttachmentsUseCase,
    private readonly downloadAttachment: DownloadAttachmentUseCase,
    private readonly deleteAttachment: DeleteAttachmentUseCase,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        type: { type: 'string', enum: ['INVOICE', 'SERVICE_NOTE', 'CONTRACT', 'OTHER'] },
      },
    },
  })
  @ApiOperation({ summary: 'Anexa um arquivo (nota fiscal, contrato...) à conta' })
  @ApiResponse({ status: HttpStatus.CREATED, type: AttachmentResponseDto })
  upload(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UploadAttachmentDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<AttachmentResponseDto> {
    return this.addAttachment.execute(id, condominiumId, body.type, file, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os anexos da conta' })
  @ApiResponse({ status: HttpStatus.OK, type: [AttachmentResponseDto] })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AttachmentResponseDto[]> {
    return this.listAttachments.execute(id, condominiumId);
  }

  @Get(':attachmentId')
  @ApiOperation({ summary: 'Baixa um anexo da conta' })
  async download(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
  ): Promise<StreamableFile> {
    const { fileName, mimeType, content } = await this.downloadAttachment.execute(
      id,
      attachmentId,
      condominiumId,
    );

    return new StreamableFile(content, {
      type: mimeType,
      disposition: `attachment; filename="${fileName}"`,
    });
  }

  @Delete(':attachmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um anexo da conta' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  remove(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
  ): Promise<void> {
    return this.deleteAttachment.execute(id, attachmentId, condominiumId);
  }
}
