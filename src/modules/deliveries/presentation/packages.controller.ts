import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { AccessTokenPayload } from '../../auth/application/ports/access-token-service';
import { CurrentUser } from '../../auth/infrastructure/http/current-user.decorator';
import { DELIVERY_ROLES } from '../../condominiums/domain/enums/membership-role';
import { CondominiumAccessGuard } from '../../condominiums/infrastructure/http/condominium-access.guard';
import { RequireMembership } from '../../condominiums/infrastructure/http/require-membership.decorator';
import { CreatePackageDto } from '../application/dto/create-package.dto';
import { DeliverPackageDto } from '../application/dto/deliver-package.dto';
import { ListPackagesQueryDto } from '../application/dto/list-packages-query.dto';
import {
  PackageResponseDto,
  PaginatedPackagesResponseDto,
} from '../application/dto/package-response.dto';
import { SigningSessionResponseDto } from '../application/dto/signing-session-response.dto';
import { CreatePackageUseCase } from '../application/use-cases/create-package.use-case';
import { CreateSigningSessionUseCase } from '../application/use-cases/create-signing-session.use-case';
import { DeliverPackageUseCase } from '../application/use-cases/deliver-package.use-case';
import { GetPackageUseCase } from '../application/use-cases/get-package.use-case';
import { ListPackagesUseCase } from '../application/use-cases/list-packages.use-case';

@ApiTags('Encomendas')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...DELIVERY_ROLES)
@Controller('condominiums/:condominiumId/packages')
export class PackagesController {
  constructor(
    private readonly createPackage: CreatePackageUseCase,
    private readonly listPackages: ListPackagesUseCase,
    private readonly getPackage: GetPackageUseCase,
    private readonly deliverPackage: DeliverPackageUseCase,
    private readonly createSigningSession: CreateSigningSessionUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registra uma encomenda recebida na portaria' })
  @ApiResponse({ status: HttpStatus.CREATED, type: PackageResponseDto })
  create(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() body: CreatePackageDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<PackageResponseDto> {
    return this.createPackage.execute(body, condominiumId, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Lista encomendas da portaria' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedPackagesResponseDto })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query() query: ListPackagesQueryDto,
  ): Promise<PaginatedPackagesResponseDto> {
    return this.listPackages.execute(query, condominiumId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha uma encomenda (inclui assinatura se já entregue)' })
  @ApiResponse({ status: HttpStatus.OK, type: PackageResponseDto })
  findById(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PackageResponseDto> {
    return this.getPackage.execute(id, condominiumId);
  }

  @Post(':id/deliver')
  @ApiOperation({ summary: 'Protocola a entrega com assinatura de quem retirou' })
  @ApiResponse({ status: HttpStatus.OK, type: PackageResponseDto })
  deliver(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: DeliverPackageDto,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<PackageResponseDto> {
    return this.deliverPackage.execute(id, condominiumId, user.sub, body);
  }

  @Post(':id/signing-session')
  @ApiOperation({
    summary: 'Gera (ou reaproveita) um QR Code para assinar a entrega pelo celular',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: SigningSessionResponseDto })
  createSigningSessionFor(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SigningSessionResponseDto> {
    return this.createSigningSession.execute(id, condominiumId);
  }
}
