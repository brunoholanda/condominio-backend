import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BookingResponseDto } from '../application/dto/booking-response.dto';
import { CreateBookingDto } from '../application/dto/create-booking.dto';
import { CancelMyBookingUseCase } from '../application/use-cases/cancel-my-booking.use-case';
import { CreateBookingUseCase } from '../application/use-cases/create-booking.use-case';
import { ListMyBookingsUseCase } from '../application/use-cases/list-my-bookings.use-case';
import type { RequestWithResidentAccount } from '../infrastructure/http/resident-account-access.guard';
import { ResidentAccountAccessGuard } from '../infrastructure/http/resident-account-access.guard';

/** Booking as a resident: requires a resident account for the condo of `:slug`. */
@ApiTags('Reservas (morador)')
@ApiBearerAuth()
@UseGuards(ResidentAccountAccessGuard)
@Controller('c/:slug/bookings')
export class ResidentBookingsController {
  constructor(
    private readonly createBooking: CreateBookingUseCase,
    private readonly listMyBookings: ListMyBookingsUseCase,
    private readonly cancelMyBooking: CancelMyBookingUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Solicita a reserva de uma área comum' })
  @ApiResponse({ status: 201, type: BookingResponseDto })
  create(
    @Req() request: RequestWithResidentAccount,
    @Body() body: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    const account = request.residentAccount!;

    return this.createBooking.execute(body, request.condominiumId!, account.id, account.unitNumber);
  }

  @Get()
  @ApiOperation({ summary: 'Lista as minhas reservas neste condomínio' })
  @ApiResponse({ status: 200, type: [BookingResponseDto] })
  listMine(@Req() request: RequestWithResidentAccount): Promise<BookingResponseDto[]> {
    return this.listMyBookings.execute(request.residentAccount!.id);
  }

  @Post(':bookingId/cancel')
  @ApiOperation({ summary: 'Cancela uma reserva minha' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  cancel(
    @Req() request: RequestWithResidentAccount,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ): Promise<BookingResponseDto> {
    return this.cancelMyBooking.execute(
      bookingId,
      request.condominiumId!,
      request.residentAccount!.id,
    );
  }
}
