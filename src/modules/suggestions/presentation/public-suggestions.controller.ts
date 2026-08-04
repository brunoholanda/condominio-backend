import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../../auth/infrastructure/http/public.decorator';
import { GetCondominiumBySlugUseCase } from '../../condominiums/application/use-cases/get-condominium-by-slug.use-case';
import { CreateSuggestionDto } from '../application/dto/create-suggestion.dto';
import { SuggestionResponseDto } from '../application/dto/suggestion-response.dto';
import {
  VerifySuggestionIdentityDto,
  VerifySuggestionIdentityResponseDto,
} from '../application/dto/verify-suggestion-identity.dto';
import { CreateSuggestionUseCase } from '../application/use-cases/create-suggestion.use-case';
import { VerifySuggestionIdentityUseCase } from '../application/use-cases/verify-suggestion-identity.use-case';

@ApiTags('Sugestões (público)')
@Controller('c/:slug/suggestions')
export class PublicSuggestionsController {
  constructor(
    private readonly getCondominiumBySlug: GetCondominiumBySlugUseCase,
    private readonly verifyIdentity: VerifySuggestionIdentityUseCase,
    private readonly createSuggestion: CreateSuggestionUseCase,
  ) {}

  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Valida unidade + CPF do titular cadastrado' })
  @ApiResponse({ status: HttpStatus.OK, type: VerifySuggestionIdentityResponseDto })
  async verify(
    @Param('slug') slug: string,
    @Body() body: VerifySuggestionIdentityDto,
  ): Promise<VerifySuggestionIdentityResponseDto> {
    const condominium = await this.getCondominiumBySlug.getOrFail(slug);

    return this.verifyIdentity.execute(condominium.id, body);
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Envia uma sugestão após validar unidade + CPF' })
  @ApiResponse({ status: HttpStatus.CREATED, type: SuggestionResponseDto })
  async create(
    @Param('slug') slug: string,
    @Body() body: CreateSuggestionDto,
  ): Promise<SuggestionResponseDto> {
    const condominium = await this.getCondominiumBySlug.getOrFail(slug);

    return this.createSuggestion.execute(condominium.id, body);
  }
}
