import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../../auth/infrastructure/http/public.decorator';
import { PublicCondominiumDto } from '../application/dto/condominium-response.dto';
import { GetCondominiumBySlugUseCase } from '../application/use-cases/get-condominium-by-slug.use-case';
import { ListCondoUnitsUseCase } from '../application/use-cases/list-condo-units.use-case';

/** Public hub of a condo: whatever a visitor can see without logging in. */
@ApiTags('Condomínios (público)')
@Controller('c')
export class PublicCondominiumsController {
  constructor(
    private readonly getCondominiumBySlug: GetCondominiumBySlugUseCase,
    private readonly listCondoUnits: ListCondoUnitsUseCase,
  ) {}

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Perfil público do condomínio' })
  @ApiResponse({ status: 200, type: PublicCondominiumDto })
  getBySlug(@Param('slug') slug: string): Promise<PublicCondominiumDto> {
    return this.getCondominiumBySlug.execute(slug);
  }

  @Public()
  @Get(':slug/units')
  @ApiOperation({ summary: 'Unidades existentes no condomínio' })
  @ApiResponse({ status: 200, type: [String] })
  units(@Param('slug') slug: string): Promise<string[]> {
    return this.listCondoUnits.bySlug(slug);
  }
}
