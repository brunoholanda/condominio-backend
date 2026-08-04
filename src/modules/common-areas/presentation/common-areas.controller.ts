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
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CondominiumAccessGuard } from '../../condominiums/infrastructure/http/condominium-access.guard';
import { MembershipRole } from '../../condominiums/domain/enums/membership-role';
import { RequireMembership } from '../../condominiums/infrastructure/http/require-membership.decorator';
import { CommonAreaResponseDto } from '../application/dto/common-area-response.dto';
import { CreateCommonAreaDto } from '../application/dto/create-common-area.dto';
import { UpdateCommonAreaDto } from '../application/dto/update-common-area.dto';
import { CreateCommonAreaUseCase } from '../application/use-cases/create-common-area.use-case';
import { DeleteCommonAreaUseCase } from '../application/use-cases/delete-common-area.use-case';
import { ListCommonAreasUseCase } from '../application/use-cases/list-common-areas.use-case';
import { UpdateCommonAreaUseCase } from '../application/use-cases/update-common-area.use-case';

const MANAGEMENT_ROLES = [MembershipRole.Owner, MembershipRole.Manager];

@ApiTags('Áreas comuns')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...MANAGEMENT_ROLES)
@Controller('condominiums/:condominiumId/common-areas')
export class CommonAreasController {
  constructor(
    private readonly createCommonArea: CreateCommonAreaUseCase,
    private readonly listCommonAreas: ListCommonAreasUseCase,
    private readonly updateCommonArea: UpdateCommonAreaUseCase,
    private readonly deleteCommonArea: DeleteCommonAreaUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma área comum' })
  @ApiResponse({ status: HttpStatus.CREATED, type: CommonAreaResponseDto })
  create(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() body: CreateCommonAreaDto,
  ): Promise<CommonAreaResponseDto> {
    return this.createCommonArea.execute(body, condominiumId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as áreas comuns (inclusive inativas)' })
  @ApiResponse({ status: HttpStatus.OK, type: [CommonAreaResponseDto] })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
  ): Promise<CommonAreaResponseDto[]> {
    return this.listCommonAreas.execute(condominiumId, false);
  }

  @Put(':areaId')
  @ApiOperation({ summary: 'Atualiza uma área comum' })
  @ApiResponse({ status: HttpStatus.OK, type: CommonAreaResponseDto })
  update(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('areaId', ParseUUIDPipe) areaId: string,
    @Body() body: UpdateCommonAreaDto,
  ): Promise<CommonAreaResponseDto> {
    return this.updateCommonArea.execute(areaId, body, condominiumId);
  }

  @Delete(':areaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma área comum' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  remove(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('areaId', ParseUUIDPipe) areaId: string,
  ): Promise<void> {
    return this.deleteCommonArea.execute(areaId, condominiumId);
  }
}
