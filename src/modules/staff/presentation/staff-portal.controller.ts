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

import { BusinessRuleError } from '../../../shared/domain/domain-error';
import { Public } from '../../auth/infrastructure/http/public.decorator';
import { GetCondominiumBySlugUseCase } from '../../condominiums/application/use-cases/get-condominium-by-slug.use-case';
import { CreatePackageDto } from '../../deliveries/application/dto/create-package.dto';
import { DeliverPackageDto } from '../../deliveries/application/dto/deliver-package.dto';
import { ListPackagesQueryDto } from '../../deliveries/application/dto/list-packages-query.dto';
import {
  PackageResponseDto,
  PaginatedPackagesResponseDto,
} from '../../deliveries/application/dto/package-response.dto';
import { SigningSessionResponseDto } from '../../deliveries/application/dto/signing-session-response.dto';
import { CreatePackageUseCase } from '../../deliveries/application/use-cases/create-package.use-case';
import { CreateSigningSessionUseCase } from '../../deliveries/application/use-cases/create-signing-session.use-case';
import { DeliverPackageUseCase } from '../../deliveries/application/use-cases/deliver-package.use-case';
import { ListPackagesUseCase } from '../../deliveries/application/use-cases/list-packages.use-case';
import {
  CreateVisitorPassDto,
  ListVisitorPassesQueryDto,
  VisitorPassResponseDto,
} from '../../visitors/application/dto/visitor-pass.dto';
import {
  CheckInVisitorPassUseCase,
  CreateVisitorPassUseCase,
  ListVisitorPassesUseCase,
} from '../../visitors/application/use-cases/visitor-pass.use-case';
import { CondoEmployeeRepository } from '../domain/repositories/condo-employee.repository';
import type { StaffTokenPayload } from '../application/use-cases/staff-auth.use-case';
import {
  CurrentStaff,
  StaffJwtAuthGuard,
} from '../infrastructure/http/staff-jwt.guard';

type StaffModule = 'timeClock' | 'visitors' | 'deliveries';

@ApiTags('Portal do funcionário')
@Public()
@UseGuards(StaffJwtAuthGuard)
@ApiBearerAuth()
@Controller('c/:slug/staff')
export class StaffPortalController {
  constructor(
    private readonly getBySlug: GetCondominiumBySlugUseCase,
    private readonly employees: CondoEmployeeRepository,
    private readonly createVisitor: CreateVisitorPassUseCase,
    private readonly listVisitors: ListVisitorPassesUseCase,
    private readonly checkInVisitor: CheckInVisitorPassUseCase,
    private readonly createPackage: CreatePackageUseCase,
    private readonly listPackages: ListPackagesUseCase,
    private readonly deliverPackage: DeliverPackageUseCase,
    private readonly createSigningSession: CreateSigningSessionUseCase,
  ) {}

  private async assertModule(
    slug: string,
    staff: StaffTokenPayload,
    module: StaffModule,
  ): Promise<{ condominiumId: string; employeeId: string }> {
    const condo = await this.getBySlug.getOrFail(slug);

    if (staff.condominiumId !== condo.id) {
      throw new BusinessRuleError('Sessão inválida para este condomínio.');
    }

    const employee = await this.employees.findById(staff.sub, condo.id);

    if (!employee || !employee.isActive) {
      throw new BusinessRuleError('Funcionário não encontrado ou inativo.');
    }

    const allowed =
      (module === 'timeClock' && employee.canAccessTimeClock) ||
      (module === 'visitors' && employee.canAccessVisitors) ||
      (module === 'deliveries' && employee.canAccessDeliveries);

    if (!allowed) {
      throw new BusinessRuleError(
        'Este funcionário não tem acesso a este módulo.',
        'STAFF_MODULE_DENIED',
      );
    }

    return { condominiumId: condo.id, employeeId: employee.id };
  }

  @Post('visitors')
  @ApiOperation({ summary: 'Portal: registra visitante' })
  @ApiResponse({ status: HttpStatus.CREATED, type: VisitorPassResponseDto })
  async createVisitorPass(
    @Param('slug') slug: string,
    @CurrentStaff() staff: StaffTokenPayload,
    @Body() body: CreateVisitorPassDto,
  ): Promise<VisitorPassResponseDto> {
    const { condominiumId, employeeId } = await this.assertModule(slug, staff, 'visitors');

    return this.createVisitor.executeAsEmployee(condominiumId, employeeId, body);
  }

  @Get('visitors')
  @ApiOperation({ summary: 'Portal: lista visitantes' })
  @ApiResponse({ status: HttpStatus.OK, type: [VisitorPassResponseDto] })
  async listVisitorPasses(
    @Param('slug') slug: string,
    @CurrentStaff() staff: StaffTokenPayload,
    @Query() query: ListVisitorPassesQueryDto,
  ): Promise<VisitorPassResponseDto[]> {
    const { condominiumId } = await this.assertModule(slug, staff, 'visitors');

    return this.listVisitors.execute(condominiumId, query);
  }

  @Post('visitors/:passId/check-in')
  @ApiOperation({ summary: 'Portal: check-in de visitante' })
  @ApiResponse({ status: HttpStatus.OK, type: VisitorPassResponseDto })
  async checkInVisitorPass(
    @Param('slug') slug: string,
    @CurrentStaff() staff: StaffTokenPayload,
    @Param('passId', ParseUUIDPipe) passId: string,
  ): Promise<VisitorPassResponseDto> {
    const { condominiumId, employeeId } = await this.assertModule(slug, staff, 'visitors');

    return this.checkInVisitor.executeAsEmployee(condominiumId, passId, employeeId);
  }

  @Post('packages')
  @ApiOperation({ summary: 'Portal: registra encomenda' })
  @ApiResponse({ status: HttpStatus.CREATED, type: PackageResponseDto })
  async createParcel(
    @Param('slug') slug: string,
    @CurrentStaff() staff: StaffTokenPayload,
    @Body() body: CreatePackageDto,
  ): Promise<PackageResponseDto> {
    const { condominiumId, employeeId } = await this.assertModule(slug, staff, 'deliveries');

    return this.createPackage.executeAsEmployee(body, condominiumId, employeeId);
  }

  @Get('packages')
  @ApiOperation({ summary: 'Portal: lista encomendas' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedPackagesResponseDto })
  async listParcels(
    @Param('slug') slug: string,
    @CurrentStaff() staff: StaffTokenPayload,
    @Query() query: ListPackagesQueryDto,
  ): Promise<PaginatedPackagesResponseDto> {
    const { condominiumId } = await this.assertModule(slug, staff, 'deliveries');

    return this.listPackages.execute(query, condominiumId);
  }

  @Post('packages/:id/deliver')
  @ApiOperation({ summary: 'Portal: protocola entrega com assinatura' })
  @ApiResponse({ status: HttpStatus.OK, type: PackageResponseDto })
  async deliverParcel(
    @Param('slug') slug: string,
    @CurrentStaff() staff: StaffTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: DeliverPackageDto,
  ): Promise<PackageResponseDto> {
    const { condominiumId, employeeId } = await this.assertModule(slug, staff, 'deliveries');

    return this.deliverPackage.executeAsEmployee(id, condominiumId, employeeId, body);
  }

  @Post('packages/:id/signing-session')
  @ApiOperation({ summary: 'Portal: gera QR de assinatura da entrega' })
  @ApiResponse({ status: HttpStatus.CREATED, type: SigningSessionResponseDto })
  async signingSession(
    @Param('slug') slug: string,
    @CurrentStaff() staff: StaffTokenPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SigningSessionResponseDto> {
    const { condominiumId } = await this.assertModule(slug, staff, 'deliveries');

    return this.createSigningSession.execute(id, condominiumId);
  }
}
