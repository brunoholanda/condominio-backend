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
import { MembershipRole } from '../../condominiums/domain/enums/membership-role';
import { CondominiumAccessGuard } from '../../condominiums/infrastructure/http/condominium-access.guard';
import { RequireMembership } from '../../condominiums/infrastructure/http/require-membership.decorator';
import {
  CreateVisitorPassDto,
  ListVisitorPassesQueryDto,
  VisitorPassResponseDto,
} from '../application/dto/visitor-pass.dto';
import {
  CancelVisitorPassUseCase,
  CheckInVisitorPassUseCase,
  CreateVisitorPassUseCase,
  ListVisitorPassesUseCase,
} from '../application/use-cases/visitor-pass.use-case';

const DESK_ROLES = [
  MembershipRole.Owner,
  MembershipRole.Manager,
  MembershipRole.Operator,
  MembershipRole.Doorman,
];

const CREATE_LIST_ROLES = [
  MembershipRole.Owner,
  MembershipRole.Manager,
  MembershipRole.Operator,
];

const CANCEL_ROLES = [MembershipRole.Owner, MembershipRole.Manager];

@ApiTags('Visitantes')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...DESK_ROLES)
@Controller('condominiums/:condominiumId/visitors')
export class VisitorsController {
  constructor(
    private readonly createPass: CreateVisitorPassUseCase,
    private readonly listPasses: ListVisitorPassesUseCase,
    private readonly checkInPass: CheckInVisitorPassUseCase,
    private readonly cancelPass: CancelVisitorPassUseCase,
  ) {}

  @Post()
  @RequireMembership(...CREATE_LIST_ROLES)
  @ApiOperation({ summary: 'Registra passe de visitante' })
  @ApiResponse({ status: HttpStatus.CREATED, type: VisitorPassResponseDto })
  create(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @CurrentUser() user: AccessTokenPayload,
    @Body() body: CreateVisitorPassDto,
  ): Promise<VisitorPassResponseDto> {
    return this.createPass.execute(condominiumId, user.sub, body);
  }

  @Get()
  @RequireMembership(...DESK_ROLES)
  @ApiOperation({ summary: 'Lista passes de visitante' })
  @ApiResponse({ status: HttpStatus.OK, type: [VisitorPassResponseDto] })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query() query: ListVisitorPassesQueryDto,
  ): Promise<VisitorPassResponseDto[]> {
    return this.listPasses.execute(condominiumId, query);
  }

  @Post(':passId/check-in')
  @ApiOperation({ summary: 'Registra entrada do visitante (portaria)' })
  @ApiResponse({ status: HttpStatus.OK, type: VisitorPassResponseDto })
  checkIn(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('passId', ParseUUIDPipe) passId: string,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<VisitorPassResponseDto> {
    return this.checkInPass.execute(condominiumId, passId, user.sub);
  }

  @Post(':passId/cancel')
  @RequireMembership(...CANCEL_ROLES)
  @ApiOperation({ summary: 'Cancela passe de visitante' })
  @ApiResponse({ status: HttpStatus.OK, type: VisitorPassResponseDto })
  cancel(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('passId', ParseUUIDPipe) passId: string,
  ): Promise<VisitorPassResponseDto> {
    return this.cancelPass.execute(condominiumId, passId);
  }
}
