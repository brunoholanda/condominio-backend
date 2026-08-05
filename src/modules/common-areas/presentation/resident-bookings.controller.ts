import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { Public } from '../../auth/infrastructure/http/public.decorator';
import { AuthenticationError } from '../../../shared/domain/domain-error';
import { GetCondominiumBySlugUseCase } from '../../condominiums/application/use-cases/get-condominium-by-slug.use-case';
import { BookingResponseDto } from '../application/dto/booking-response.dto';
import { CreateBookingDto } from '../application/dto/create-booking.dto';
import { CancelMyBookingUseCase } from '../application/use-cases/cancel-my-booking.use-case';
import { CreateBookingUseCase } from '../application/use-cases/create-booking.use-case';
import { ListMyBookingsUseCase } from '../application/use-cases/list-my-bookings.use-case';
import type { ResidentBookingTokenPayload } from '../application/services/resident-booking-access-token.service';
import {
  CurrentBookingResident,
  ResidentBookingJwtGuard,
} from '../infrastructure/http/resident-booking-jwt.guard';

/** Reservas do morador autenticado por CPF + código (sem conta de usuário). */
@ApiTags('Reservas (morador)')
@ApiBearerAuth()
@Public()
@UseGuards(ResidentBookingJwtGuard)
@Controller('c/:slug/bookings')
export class ResidentBookingsController {
  constructor(
    private readonly getBySlug: GetCondominiumBySlugUseCase,
    private readonly createBooking: CreateBookingUseCase,
    private readonly listMyBookings: ListMyBookingsUseCase,
    private readonly cancelMyBooking: CancelMyBookingUseCase,
  ) {}

  private assertCondo(
    actor: ResidentBookingTokenPayload,
    condominiumId: string,
  ): void {
    if (actor.condominiumId !== condominiumId) {
      throw new AuthenticationError('Sessão inválida para este condomínio.');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Solicita a reserva de uma área comum' })
  @ApiResponse({ status: 201, type: BookingResponseDto })
  async create(
    @Param('slug') slug: string,
    @CurrentBookingResident() actor: ResidentBookingTokenPayload,
    @Body() body: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    const condo = await this.getBySlug.getOrFail(slug);
    this.assertCondo(actor, condo.id);

    return this.createBooking.execute(body, condo.id, actor.sub, actor.unitNumber);
  }

  @Get()
  @ApiOperation({ summary: 'Lista as minhas reservas neste condomínio' })
  @ApiResponse({ status: 200, type: [BookingResponseDto] })
  async listMine(
    @Param('slug') slug: string,
    @CurrentBookingResident() actor: ResidentBookingTokenPayload,
  ): Promise<BookingResponseDto[]> {
    const condo = await this.getBySlug.getOrFail(slug);
    this.assertCondo(actor, condo.id);

    return this.listMyBookings.execute(actor.sub);
  }

  @Post(':bookingId/cancel')
  @ApiOperation({ summary: 'Cancela uma reserva minha' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  async cancel(
    @Param('slug') slug: string,
    @CurrentBookingResident() actor: ResidentBookingTokenPayload,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ): Promise<BookingResponseDto> {
    const condo = await this.getBySlug.getOrFail(slug);
    this.assertCondo(actor, condo.id);

    return this.cancelMyBooking.execute(bookingId, condo.id, actor.sub);
  }
}
