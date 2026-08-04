import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateUsefulContactDto } from '../application/dto/create-useful-contact.dto';
import { ReorderUsefulContactsDto } from '../application/dto/reorder-useful-contacts.dto';
import { UpdateUsefulContactDto } from '../application/dto/update-useful-contact.dto';
import { UsefulContactResponseDto } from '../application/dto/useful-contact-response.dto';
import { CreateUsefulContactUseCase } from '../application/use-cases/create-useful-contact.use-case';
import { DeleteUsefulContactUseCase } from '../application/use-cases/delete-useful-contact.use-case';
import { ListUsefulContactsUseCase } from '../application/use-cases/list-useful-contacts.use-case';
import { ReorderUsefulContactsUseCase } from '../application/use-cases/reorder-useful-contacts.use-case';
import { UpdateUsefulContactUseCase } from '../application/use-cases/update-useful-contact.use-case';

const MANAGEMENT_ROLES = [MembershipRole.Owner, MembershipRole.Manager];

@ApiTags('Contatos úteis (gestão)')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...MANAGEMENT_ROLES)
@Controller('condominiums/:condominiumId/contacts')
export class UsefulContactsController {
  constructor(
    private readonly createUsefulContact: CreateUsefulContactUseCase,
    private readonly listUsefulContacts: ListUsefulContactsUseCase,
    private readonly updateUsefulContact: UpdateUsefulContactUseCase,
    private readonly deleteUsefulContact: DeleteUsefulContactUseCase,
    private readonly reorderUsefulContacts: ReorderUsefulContactsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um contato útil' })
  @ApiResponse({ status: 201, type: UsefulContactResponseDto })
  create(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() body: CreateUsefulContactDto,
  ): Promise<UsefulContactResponseDto> {
    return this.createUsefulContact.execute(body, condominiumId);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os contatos úteis do condomínio' })
  @ApiResponse({ status: 200, type: [UsefulContactResponseDto] })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
  ): Promise<UsefulContactResponseDto[]> {
    return this.listUsefulContacts.execute(condominiumId);
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reordena os contatos úteis' })
  @ApiResponse({ status: 200, type: [UsefulContactResponseDto] })
  reorder(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Body() body: ReorderUsefulContactsDto,
  ): Promise<UsefulContactResponseDto[]> {
    return this.reorderUsefulContacts.execute(condominiumId, body.orderedIds);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um contato útil' })
  @ApiResponse({ status: 200, type: UsefulContactResponseDto })
  update(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUsefulContactDto,
  ): Promise<UsefulContactResponseDto> {
    return this.updateUsefulContact.execute(id, body, condominiumId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um contato útil' })
  @ApiResponse({ status: 200 })
  delete(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.deleteUsefulContact.execute(id, condominiumId);
  }
}
