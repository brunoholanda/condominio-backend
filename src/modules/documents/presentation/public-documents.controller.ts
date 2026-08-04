import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../../auth/infrastructure/http/public.decorator';
import { GetCondominiumBySlugUseCase } from '../../condominiums/application/use-cases/get-condominium-by-slug.use-case';
import { DocumentResponseDto } from '../application/dto/document-response.dto';
import { GetDocumentUseCase } from '../application/use-cases/get-document.use-case';
import { ListDocumentsUseCase } from '../application/use-cases/list-documents.use-case';

@ApiTags('Documentos (público)')
@Controller('c/:slug/documents')
export class PublicDocumentsController {
  constructor(
    private readonly getCondominiumBySlug: GetCondominiumBySlugUseCase,
    private readonly listDocuments: ListDocumentsUseCase,
    private readonly getDocument: GetDocumentUseCase,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lista os documentos públicos do condomínio' })
  @ApiResponse({ status: 200, type: [DocumentResponseDto] })
  async list(@Param('slug') slug: string): Promise<DocumentResponseDto[]> {
    const condominium = await this.getCondominiumBySlug.getOrFail(slug);

    return this.listDocuments.execute(condominium.id, true);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtém um documento público pelo id' })
  @ApiResponse({ status: 200, type: DocumentResponseDto })
  async getById(
    @Param('slug') slug: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DocumentResponseDto> {
    const condominium = await this.getCondominiumBySlug.getOrFail(slug);
    const document = await this.getDocument.getPublicOrFail(id, condominium.id);

    return this.getDocument.execute(document.id, condominium.id);
  }
}
