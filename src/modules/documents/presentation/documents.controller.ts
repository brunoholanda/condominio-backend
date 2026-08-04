import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { AccessTokenPayload } from '../../auth/application/ports/access-token-service';
import { CurrentUser } from '../../auth/infrastructure/http/current-user.decorator';
import { CondominiumAccessGuard } from '../../condominiums/infrastructure/http/condominium-access.guard';
import { MembershipRole } from '../../condominiums/domain/enums/membership-role';
import { RequireMembership } from '../../condominiums/infrastructure/http/require-membership.decorator';
import { CreateDocumentDto } from '../application/dto/create-document.dto';
import { DocumentResponseDto } from '../application/dto/document-response.dto';
import { UpdateDocumentDto } from '../application/dto/update-document.dto';
import { CreateDocumentUseCase } from '../application/use-cases/create-document.use-case';
import { DeleteDocumentUseCase } from '../application/use-cases/delete-document.use-case';
import { GetDocumentUseCase } from '../application/use-cases/get-document.use-case';
import { ListDocumentsUseCase } from '../application/use-cases/list-documents.use-case';
import { UpdateDocumentUseCase } from '../application/use-cases/update-document.use-case';

const MANAGEMENT_ROLES = [MembershipRole.Owner, MembershipRole.Manager];

@ApiTags('Documentos (gestão)')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...MANAGEMENT_ROLES)
@Controller('condominiums/:condominiumId/documents')
export class DocumentsController {
  constructor(
    private readonly createDocument: CreateDocumentUseCase,
    private readonly listDocuments: ListDocumentsUseCase,
    private readonly getDocument: GetDocumentUseCase,
    private readonly updateDocument: UpdateDocumentUseCase,
    private readonly deleteDocument: DeleteDocumentUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Publica um novo documento' })
  @ApiResponse({ status: 201, type: DocumentResponseDto })
  create(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() body: CreateDocumentDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<DocumentResponseDto> {
    return this.createDocument.execute(body, condominiumId, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os documentos do condomínio' })
  @ApiResponse({ status: 200, type: [DocumentResponseDto] })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
  ): Promise<DocumentResponseDto[]> {
    return this.listDocuments.execute(condominiumId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém um documento pelo id' })
  @ApiResponse({ status: 200, type: DocumentResponseDto })
  getById(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DocumentResponseDto> {
    return this.getDocument.execute(id, condominiumId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um documento' })
  @ApiResponse({ status: 200, type: DocumentResponseDto })
  update(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateDocumentDto,
  ): Promise<DocumentResponseDto> {
    return this.updateDocument.execute(id, body, condominiumId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um documento' })
  @ApiResponse({ status: 200 })
  delete(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.deleteDocument.execute(id, condominiumId);
  }
}
