import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuditAccess } from '../../../shared/infrastructure/http/audit-access.decorator';
import { Public } from '../../auth/infrastructure/http/public.decorator';
import { GetCondominiumBySlugUseCase } from '../../condominiums/application/use-cases/get-condominium-by-slug.use-case';
import { ListCondoUnitsUseCase } from '../../condominiums/application/use-cases/list-condo-units.use-case';
import { CreateResidentDto } from '../application/dto/create-resident.dto';
import { ResidentResponseDto } from '../application/dto/resident-response.dto';
import { CreateResidentUseCase } from '../application/use-cases/create-resident.use-case';

/** Sending the form is open to anyone (it is filled by the resident). */
@ApiTags('Moradores (público)')
@Controller('c/:slug/residents')
export class PublicCondoResidentsController {
  constructor(
    private readonly createResident: CreateResidentUseCase,
    private readonly getCondominiumBySlug: GetCondominiumBySlugUseCase,
    private readonly listCondoUnits: ListCondoUnitsUseCase,
  ) {}

  @Public()
  @Post()
  @AuditAccess('enviou um cadastro pelo formulário público')
  @ApiOperation({ summary: 'Cadastra um morador (aberto ao público)' })
  @ApiResponse({ status: 201, type: ResidentResponseDto })
  @ApiResponse({ status: 409, description: 'CPF ou unidade já cadastrados' })
  async create(
    @Param('slug') slug: string,
    @Body() body: CreateResidentDto,
  ): Promise<ResidentResponseDto> {
    const condominium = await this.getCondominiumBySlug.getOrFail(slug);
    const allowedUnits = await this.listCondoUnits.byId(condominium.id);

    return this.createResident.execute(body, condominium.id, allowedUnits);
  }
}
