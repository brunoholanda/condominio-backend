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

import type { AccessTokenPayload } from '../../auth/application/ports/access-token-service';
import { CurrentUser } from '../../auth/infrastructure/http/current-user.decorator';
import { AddMembershipDto } from '../application/dto/add-membership.dto';
import { MembershipMemberDto } from '../application/dto/membership-member.dto';
import { UpdateMembershipRoleDto } from '../application/dto/update-membership-role.dto';
import { AddMembershipUseCase } from '../application/use-cases/add-membership.use-case';
import { ListMembershipsUseCase } from '../application/use-cases/list-memberships.use-case';
import { RemoveMembershipUseCase } from '../application/use-cases/remove-membership.use-case';
import { UpdateMembershipRoleUseCase } from '../application/use-cases/update-membership-role.use-case';
import { MembershipRole } from '../domain/enums/membership-role';
import { CondominiumAccessGuard } from '../infrastructure/http/condominium-access.guard';
import { RequireMembership } from '../infrastructure/http/require-membership.decorator';

/**
 * Team management is OWNER-only: who can see residents, finance, etc.
 * Creating a platform account here is how a síndico onboards operators without
 * asking them to self-register first.
 */
@ApiTags('Equipe do condomínio')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(MembershipRole.Owner)
@Controller('condominiums/:condominiumId/members')
export class MembershipsController {
  constructor(
    private readonly listMemberships: ListMembershipsUseCase,
    private readonly addMembership: AddMembershipUseCase,
    private readonly updateMembershipRole: UpdateMembershipRoleUseCase,
    private readonly removeMembership: RemoveMembershipUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista a equipe com acesso a este condomínio' })
  @ApiResponse({ status: HttpStatus.OK, type: [MembershipMemberDto] })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
  ): Promise<MembershipMemberDto[]> {
    return this.listMemberships.execute(condominiumId);
  }

  @Post()
  @ApiOperation({
    summary: 'Adiciona alguém à equipe (cria a conta na plataforma se o e-mail for novo)',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: MembershipMemberDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Pessoa já vinculada' })
  add(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() body: AddMembershipDto,
  ): Promise<MembershipMemberDto> {
    return this.addMembership.execute(condominiumId, body);
  }

  @Put(':membershipId')
  @ApiOperation({ summary: 'Altera o papel de um membro da equipe' })
  @ApiResponse({ status: HttpStatus.OK, type: MembershipMemberDto })
  updateRole(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
    @Body() body: UpdateMembershipRoleDto,
  ): Promise<MembershipMemberDto> {
    return this.updateMembershipRole.execute(condominiumId, membershipId, body);
  }

  @Delete(':membershipId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove o acesso de alguém a este condomínio' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  remove(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('membershipId', ParseUUIDPipe) membershipId: string,
    @CurrentUser() user: AccessTokenPayload,
  ): Promise<void> {
    return this.removeMembership.execute(condominiumId, membershipId, user.sub);
  }
}
