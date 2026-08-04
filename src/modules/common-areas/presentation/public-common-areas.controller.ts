import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../../auth/infrastructure/http/public.decorator';
import { GetCondominiumBySlugUseCase } from '../../condominiums/application/use-cases/get-condominium-by-slug.use-case';
import { CommonAreaResponseDto } from '../application/dto/common-area-response.dto';
import { ListCommonAreasUseCase } from '../application/use-cases/list-common-areas.use-case';

/** What a visitor sees before booking anything: only the active areas. */
@ApiTags('Áreas comuns (público)')
@Controller('c/:slug/common-areas')
export class PublicCommonAreasController {
  constructor(
    private readonly getCondominiumBySlug: GetCondominiumBySlugUseCase,
    private readonly listCommonAreas: ListCommonAreasUseCase,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lista as áreas comuns ativas do condomínio' })
  @ApiResponse({ status: 200, type: [CommonAreaResponseDto] })
  async list(@Param('slug') slug: string): Promise<CommonAreaResponseDto[]> {
    const condominium = await this.getCondominiumBySlug.getOrFail(slug);

    return this.listCommonAreas.execute(condominium.id, true);
  }
}
