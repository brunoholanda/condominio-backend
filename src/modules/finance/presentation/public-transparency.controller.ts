import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { Public } from '../../auth/infrastructure/http/public.decorator';
import { GetCondominiumBySlugUseCase } from '../../condominiums/application/use-cases/get-condominium-by-slug.use-case';
import {
  PaginatedTransparencyPayablesDto,
  TransparencyPayableDetailDto,
} from '../application/dto/transparency-payable.dto';
import { DownloadTransparencyAttachmentUseCase } from '../application/use-cases/download-transparency-attachment.use-case';
import { GetTransparencyPayableUseCase } from '../application/use-cases/get-transparency-payable.use-case';
import { ListTransparencyPayablesUseCase } from '../application/use-cases/list-transparency-payables.use-case';

class TransparencyQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

@ApiTags('Portal da transparência')
@Controller('c/:slug/transparency')
export class PublicTransparencyController {
  constructor(
    private readonly getCondominiumBySlug: GetCondominiumBySlugUseCase,
    private readonly listTransparencyPayables: ListTransparencyPayablesUseCase,
    private readonly getTransparencyPayable: GetTransparencyPayableUseCase,
    private readonly downloadTransparencyAttachment: DownloadTransparencyAttachmentUseCase,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lista as contas pagas do condomínio (portal da transparência)' })
  @ApiResponse({ status: 200, type: PaginatedTransparencyPayablesDto })
  async list(
    @Param('slug') slug: string,
    @Query() query: TransparencyQueryDto,
  ): Promise<PaginatedTransparencyPayablesDto> {
    const condominium = await this.getCondominiumBySlug.getOrFail(slug);

    return this.listTransparencyPayables.execute(condominium.id, {
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }

  @Public()
  @Get(':payableId')
  @ApiOperation({ summary: 'Detalha uma conta paga e seus anexos' })
  @ApiResponse({ status: 200, type: TransparencyPayableDetailDto })
  async detail(
    @Param('slug') slug: string,
    @Param('payableId', ParseUUIDPipe) payableId: string,
  ): Promise<TransparencyPayableDetailDto> {
    const condominium = await this.getCondominiumBySlug.getOrFail(slug);

    return this.getTransparencyPayable.execute(payableId, condominium.id);
  }

  @Public()
  @Get(':payableId/attachments/:attachmentId')
  @ApiOperation({ summary: 'Baixa um documento anexado a uma conta paga' })
  @ApiProduces('application/octet-stream')
  async download(
    @Param('slug') slug: string,
    @Param('payableId', ParseUUIDPipe) payableId: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
  ): Promise<StreamableFile> {
    const condominium = await this.getCondominiumBySlug.getOrFail(slug);
    const { fileName, mimeType, content } = await this.downloadTransparencyAttachment.execute(
      payableId,
      attachmentId,
      condominium.id,
    );

    return new StreamableFile(content, {
      type: mimeType,
      disposition: `inline; filename="${fileName}"`,
    });
  }
}
