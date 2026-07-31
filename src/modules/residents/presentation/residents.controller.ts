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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../../auth/infrastructure/http/public.decorator';
import { CreateResidentDto } from '../application/dto/create-resident.dto';
import { ListResidentsQueryDto } from '../application/dto/list-residents-query.dto';
import {
  PaginatedResidentsResponseDto,
  ResidentResponseDto,
} from '../application/dto/resident-response.dto';
import { UpdateResidentDto } from '../application/dto/update-resident.dto';
import { CreateResidentUseCase } from '../application/use-cases/create-resident.use-case';
import { DeleteResidentUseCase } from '../application/use-cases/delete-resident.use-case';
import { FindResidentByIdUseCase } from '../application/use-cases/find-resident-by-id.use-case';
import { ListResidentsUseCase } from '../application/use-cases/list-residents.use-case';
import { UpdateResidentUseCase } from '../application/use-cases/update-resident.use-case';

/**
 * Sending the form is open to anyone (it is filled by the resident), while
 * consulting the registrations requires an authenticated account.
 */
@ApiTags('Moradores')
@ApiBearerAuth()
@Controller('residents')
export class ResidentsController {
  constructor(
    private readonly createResident: CreateResidentUseCase,
    private readonly listResidents: ListResidentsUseCase,
    private readonly findResident: FindResidentByIdUseCase,
    private readonly updateResident: UpdateResidentUseCase,
    private readonly deleteResident: DeleteResidentUseCase,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Cadastra um morador (aberto ao público)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ResidentResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'CPF já cadastrado' })
  create(@Body() body: CreateResidentDto): Promise<ResidentResponseDto> {
    return this.createResident.execute(body);
  }

  @Get()
  @ApiOperation({ summary: 'Lista moradores com filtros e paginação' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedResidentsResponseDto })
  list(@Query() query: ListResidentsQueryDto): Promise<PaginatedResidentsResponseDto> {
    return this.listResidents.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha um morador' })
  @ApiResponse({ status: HttpStatus.OK, type: ResidentResponseDto })
  findById(@Param('id', ParseUUIDPipe) id: string): Promise<ResidentResponseDto> {
    return this.findResident.execute(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Substitui os dados de um morador' })
  @ApiResponse({ status: HttpStatus.OK, type: ResidentResponseDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateResidentDto,
  ): Promise<ResidentResponseDto> {
    return this.updateResident.execute(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um morador e seus dados vinculados' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteResident.execute(id);
  }
}
