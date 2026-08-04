import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { InvalidFieldError } from '../../../shared/domain/domain-error';
import { Public } from '../../auth/infrastructure/http/public.decorator';
import {
  StaffLoginDto,
  StaffLoginResponseDto,
  StaffMeResponseDto,
} from '../application/dto/staff-auth.dto';
import { TimePunchResponseDto } from '../application/dto/time-punch-response.dto';
import {
  StaffLoginUseCase,
  StaffMeUseCase,
  type StaffTokenPayload,
} from '../application/use-cases/staff-auth.use-case';
import { RegisterPunchUseCase } from '../application/use-cases/punch.use-case';
import {
  CurrentStaff,
  StaffJwtAuthGuard,
} from '../infrastructure/http/staff-jwt.guard';

@ApiTags('Ponto público')
@Controller('c/:slug/staff')
export class PublicStaffController {
  constructor(
    private readonly login: StaffLoginUseCase,
    private readonly me: StaffMeUseCase,
    private readonly registerPunch: RegisterPunchUseCase,
  ) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  @ApiOperation({ summary: 'Login do funcionário (CPF + PIN)' })
  @ApiResponse({ status: HttpStatus.OK, type: StaffLoginResponseDto })
  doLogin(
    @Param('slug') slug: string,
    @Body() body: StaffLoginDto,
  ): Promise<StaffLoginResponseDto> {
    return this.login.execute(slug, body);
  }

  @Public()
  @UseGuards(StaffJwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Perfil e próximo tipo de marcação do dia' })
  @ApiResponse({ status: HttpStatus.OK, type: StaffMeResponseDto })
  getMe(
    @Param('slug') slug: string,
    @CurrentStaff() staff: StaffTokenPayload,
  ): Promise<StaffMeResponseDto> {
    return this.me.execute(slug, staff.sub);
  }

  @Public()
  @UseGuards(StaffJwtAuthGuard)
  @ApiBearerAuth()
  @Post('punches')
  @UseInterceptors(
    FileInterceptor('selfie', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['selfie', 'type', 'latitude', 'longitude'],
      properties: {
        selfie: { type: 'string', format: 'binary' },
        type: {
          type: 'string',
          enum: ['CLOCK_IN', 'BREAK_START', 'BREAK_END', 'CLOCK_OUT'],
        },
        latitude: { type: 'number' },
        longitude: { type: 'number' },
        accuracyMeters: { type: 'number' },
      },
    },
  })
  @ApiOperation({ summary: 'Registra ponto com GPS e selfie' })
  @ApiResponse({ status: HttpStatus.CREATED, type: TimePunchResponseDto })
  punch(
    @Param('slug') slug: string,
    @CurrentStaff() staff: StaffTokenPayload,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: Record<string, string>,
    @Headers('user-agent') userAgent?: string,
  ): Promise<TimePunchResponseDto> {
    if (!file) {
      throw new InvalidFieldError('selfie', 'A selfie é obrigatória para registrar o ponto.');
    }

    return this.registerPunch.execute({
      slug,
      employeeId: staff.sub,
      type: body.type,
      latitude: Number(body.latitude),
      longitude: Number(body.longitude),
      accuracyMeters:
        body.accuracyMeters !== undefined && body.accuracyMeters !== ''
          ? Number(body.accuracyMeters)
          : null,
      userAgent: userAgent ?? null,
      selfie: {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      },
    });
  }
}
