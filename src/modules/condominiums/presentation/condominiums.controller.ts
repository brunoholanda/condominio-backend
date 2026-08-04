import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { AccessTokenPayload } from '../../auth/application/ports/access-token-service';
import { CurrentUser } from '../../auth/infrastructure/http/current-user.decorator';
import { CondominiumResponseDto } from '../application/dto/condominium-response.dto';
import { CreateCondominiumDto } from '../application/dto/create-condominium.dto';
import { GeneratePublicQrQueryDto } from '../application/dto/generate-public-qr-query.dto';
import { UpdateCondominiumDto } from '../application/dto/update-condominium.dto';
import { CreateCondominiumUseCase } from '../application/use-cases/create-condominium.use-case';
import { GeneratePublicQrPdfUseCase } from '../application/use-cases/generate-public-qr-pdf.use-case';
import { GetCondominiumUseCase } from '../application/use-cases/get-condominium.use-case';
import { ListCondoUnitsUseCase } from '../application/use-cases/list-condo-units.use-case';
import { ListMyCondominiumsUseCase } from '../application/use-cases/list-my-condominiums.use-case';
import { UpdateCondominiumUseCase } from '../application/use-cases/update-condominium.use-case';
import { MembershipRole } from '../domain/enums/membership-role';
import type { RequestWithMembership } from '../infrastructure/http/condominium-access.guard';
import { CondominiumAccessGuard } from '../infrastructure/http/condominium-access.guard';
import { RequireMembership } from '../infrastructure/http/require-membership.decorator';

@ApiTags('Condomínios')
@ApiBearerAuth()
@Controller('condominiums')
export class CondominiumsController {
  constructor(
    private readonly createCondominium: CreateCondominiumUseCase,
    private readonly listMyCondominiums: ListMyCondominiumsUseCase,
    private readonly getCondominium: GetCondominiumUseCase,
    private readonly updateCondominium: UpdateCondominiumUseCase,
    private readonly listCondoUnits: ListCondoUnitsUseCase,
    private readonly generatePublicQr: GeneratePublicQrPdfUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um condomínio (o criador vira OWNER)' })
  @ApiResponse({ status: 201, type: CondominiumResponseDto })
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() body: CreateCondominiumDto,
  ): Promise<CondominiumResponseDto> {
    return this.createCondominium.execute(user.sub, body);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os condomínios em que o usuário tem acesso' })
  @ApiResponse({ status: 200, type: [CondominiumResponseDto] })
  listMine(@CurrentUser() user: AccessTokenPayload): Promise<CondominiumResponseDto[]> {
    return this.listMyCondominiums.execute(user.sub);
  }

  @Get(':id')
  @UseGuards(CondominiumAccessGuard)
  @ApiOperation({ summary: 'Detalha um condomínio (requer vínculo)' })
  @ApiResponse({ status: 200, type: CondominiumResponseDto })
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: RequestWithMembership,
  ): Promise<CondominiumResponseDto> {
    return this.getCondominium.execute(id, request.membership?.role);
  }

  @Put(':id')
  @UseGuards(CondominiumAccessGuard)
  @RequireMembership(MembershipRole.Owner, MembershipRole.Manager)
  @ApiOperation({ summary: 'Atualiza um condomínio (OWNER ou MANAGER)' })
  @ApiResponse({ status: 200, type: CondominiumResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCondominiumDto,
  ): Promise<CondominiumResponseDto> {
    return this.updateCondominium.execute(id, body);
  }

  @Get(':id/units')
  @UseGuards(CondominiumAccessGuard)
  @ApiOperation({ summary: 'Lista as unidades do condomínio (requer vínculo)' })
  @ApiResponse({ status: 200, type: [String] })
  units(@Param('id', ParseUUIDPipe) id: string): Promise<string[]> {
    return this.listCondoUnits.byId(id);
  }

  @Get(':id/qr-code')
  @UseGuards(CondominiumAccessGuard)
  @RequireMembership(
    MembershipRole.Owner,
    MembershipRole.Manager,
    MembershipRole.Operator,
  )
  @ApiOperation({
    summary: 'Gera um PDF imprimível com QR Code do link público',
  })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: 200,
    description: 'PDF A4 com QR Code moldurado e nome do condomínio no rodapé',
    content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
  })
  async qrCode(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: GeneratePublicQrQueryDto,
  ): Promise<StreamableFile> {
    const { fileName, content } = await this.generatePublicQr.execute(id, query.target ?? 'hub');

    return new StreamableFile(content, {
      type: 'application/pdf',
      disposition: `attachment; filename="${fileName}"`,
    });
  }
}
