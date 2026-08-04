import { Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CondominiumAccessGuard } from '../../condominiums/infrastructure/http/condominium-access.guard';
import { MembershipRole } from '../../condominiums/domain/enums/membership-role';
import { RequireMembership } from '../../condominiums/infrastructure/http/require-membership.decorator';
import { BookingResponseDto } from '../application/dto/booking-response.dto';
import { ApproveBookingUseCase } from '../application/use-cases/approve-booking.use-case';
import { ListBookingsUseCase } from '../application/use-cases/list-bookings.use-case';
import { RejectBookingUseCase } from '../application/use-cases/reject-booking.use-case';
import { BookingStatus } from '../domain/enums/booking-status';

const MANAGEMENT_ROLES = [MembershipRole.Owner, MembershipRole.Manager];

@ApiTags('Reservas (gestão)')
@ApiBearerAuth()
@UseGuards(CondominiumAccessGuard)
@RequireMembership(...MANAGEMENT_ROLES)
@Controller('condominiums/:condominiumId/bookings')
export class BookingsManagerController {
  constructor(
    private readonly listBookings: ListBookingsUseCase,
    private readonly approveBooking: ApproveBookingUseCase,
    private readonly rejectBooking: RejectBookingUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista as reservas do condomínio' })
  @ApiResponse({ status: 200, type: [BookingResponseDto] })
  list(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Query('commonAreaId') commonAreaId?: string,
    @Query('status') status?: BookingStatus,
  ): Promise<BookingResponseDto[]> {
    return this.listBookings.execute(condominiumId, { commonAreaId, status });
  }

  @Post(':bookingId/approve')
  @ApiOperation({ summary: 'Aprova uma reserva solicitada' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  approve(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ): Promise<BookingResponseDto> {
    return this.approveBooking.execute(bookingId, condominiumId);
  }

  @Post(':bookingId/reject')
  @ApiOperation({ summary: 'Recusa uma reserva solicitada' })
  @ApiResponse({ status: 200, type: BookingResponseDto })
  reject(
    @Param('condominiumId', ParseUUIDPipe) condominiumId: string,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ): Promise<BookingResponseDto> {
    return this.rejectBooking.execute(bookingId, condominiumId);
  }
}
