import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiPropertyOptional, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { MANAGEMENT_ROLES } from '../../condominiums/domain/enums/membership-role';
import { CondominiumAccessGuard } from '../../condominiums/infrastructure/http/condominium-access.guard';
import { RequireMembership } from '../../condominiums/infrastructure/http/require-membership.decorator';
import { SuggestionResponseDto } from '../application/dto/suggestion-response.dto';
import { ListSuggestionsUseCase } from '../application/use-cases/list-suggestions.use-case';
import { MarkSuggestionAsReadUseCase } from '../application/use-cases/mark-suggestion-as-read.use-case';
import { SuggestionStatus } from '../domain/enums/suggestion-status';

class ListSuggestionsQueryDto {
  @ApiPropertyOptional({ enum: SuggestionStatus })
  @IsOptional()
  @IsEnum(SuggestionStatus)
  status?: SuggestionStatus;
}

@ApiTags('Sugestões')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...MANAGEMENT_ROLES)
@Controller('condominiums/:condominiumId/suggestions')
export class SuggestionsController {
  constructor(
    private readonly listSuggestions: ListSuggestionsUseCase,
    private readonly markAsRead: MarkSuggestionAsReadUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista sugestões enviadas pelos moradores' })
  @ApiResponse({ status: 200, type: [SuggestionResponseDto] })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query() query: ListSuggestionsQueryDto,
  ): Promise<SuggestionResponseDto[]> {
    return this.listSuggestions.execute(condominiumId, query.status);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Marca a sugestão como lida' })
  @ApiResponse({ status: 200, type: SuggestionResponseDto })
  read(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SuggestionResponseDto> {
    return this.markAsRead.execute(id, condominiumId);
  }
}
