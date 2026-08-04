import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../../auth/infrastructure/http/public.decorator';
import { GetCondominiumBySlugUseCase } from '../../condominiums/application/use-cases/get-condominium-by-slug.use-case';
import { UsefulContactResponseDto } from '../application/dto/useful-contact-response.dto';
import { ListUsefulContactsUseCase } from '../application/use-cases/list-useful-contacts.use-case';

/** Complements `GET /c/:slug` with the condo's public directory of useful contacts. */
@ApiTags('Contatos úteis (público)')
@Controller('c/:slug/contacts')
export class PublicUsefulContactsController {
  constructor(
    private readonly getCondominiumBySlug: GetCondominiumBySlugUseCase,
    private readonly listUsefulContacts: ListUsefulContactsUseCase,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lista os contatos úteis do condomínio' })
  @ApiResponse({ status: 200, type: [UsefulContactResponseDto] })
  async list(@Param('slug') slug: string): Promise<UsefulContactResponseDto[]> {
    const condominium = await this.getCondominiumBySlug.getOrFail(slug);

    return this.listUsefulContacts.execute(condominium.id);
  }
}
