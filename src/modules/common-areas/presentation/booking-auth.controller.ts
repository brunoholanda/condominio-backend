import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

import { Public } from '../../auth/infrastructure/http/public.decorator';
import {
  BookingAuthUseCases,
  type BookingAuthConfirmResult,
  type BookingAuthMeResult,
  type BookingAuthStartResult,
} from '../application/use-cases/booking-auth.use-cases';
import type { ResidentBookingTokenPayload } from '../application/services/resident-booking-access-token.service';
import {
  CurrentBookingResident,
  ResidentBookingJwtGuard,
} from '../infrastructure/http/resident-booking-jwt.guard';

class StartBookingAuthDto {
  @IsString()
  @Matches(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
  cpf: string;
}

class ConfirmBookingAuthDto {
  @IsString()
  @Length(36, 36)
  challengeId: string;

  @IsString()
  @Matches(/^\d{6}$/)
  code: string;
}

class ResendBookingAuthDto {
  @IsString()
  @Length(36, 36)
  challengeId: string;
}

@ApiTags('Reservas (autenticação)')
@Public()
@Controller('c/:slug/booking-auth')
export class BookingAuthController {
  constructor(private readonly auth: BookingAuthUseCases) {}

  @Post('start')
  @ApiOperation({ summary: 'Inicia verificação por CPF e envia código ao e-mail do cadastro' })
  @ApiResponse({ status: 201 })
  start(
    @Param('slug') slug: string,
    @Body() body: StartBookingAuthDto,
  ): Promise<BookingAuthStartResult> {
    return this.auth.start(slug, body.cpf);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirma o código e abre a sessão de reservas' })
  confirm(
    @Param('slug') slug: string,
    @Body() body: ConfirmBookingAuthDto,
  ): Promise<BookingAuthConfirmResult> {
    return this.auth.confirm(slug, body.challengeId, body.code);
  }

  @Post('resend')
  @ApiOperation({ summary: 'Reenvia o código de verificação' })
  resend(
    @Param('slug') slug: string,
    @Body() body: ResendBookingAuthDto,
  ): Promise<BookingAuthStartResult> {
    return this.auth.resend(slug, body.challengeId);
  }

  @Get('me')
  @UseGuards(ResidentBookingJwtGuard)
  @ApiOperation({ summary: 'Dados do morador autenticado para reservas' })
  me(
    @Param('slug') slug: string,
    @CurrentBookingResident() actor: ResidentBookingTokenPayload,
  ): Promise<BookingAuthMeResult> {
    return this.auth.me(slug, actor.sub);
  }
}
