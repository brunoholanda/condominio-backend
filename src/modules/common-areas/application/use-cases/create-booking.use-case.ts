import { Injectable } from '@nestjs/common';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { Booking } from '../../domain/entities/booking';
import { ACTIVE_BOOKING_STATUSES } from '../../domain/enums/booking-status';
import { BookingRepository } from '../../domain/repositories/booking.repository';
import type { CreateBookingDto } from '../dto/create-booking.dto';
import type { BookingResponseDto } from '../dto/booking-response.dto';
import { BookingPresenter } from '../presenters/booking.presenter';
import { GetCommonAreaUseCase } from './get-common-area.use-case';

const MS_PER_HOUR = 3_600_000;

@Injectable()
export class CreateBookingUseCase {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly getCommonArea: GetCommonAreaUseCase,
  ) {}

  async execute(
    input: CreateBookingDto,
    condominiumId: string,
    residentAccountId: string,
    unitNumber: string,
  ): Promise<BookingResponseDto> {
    const area = await this.getCommonArea.getOrFail(input.commonAreaId, condominiumId);

    if (!area.active) {
      throw new BusinessRuleError('Esta área comum não está disponível para reservas.');
    }

    const startsAt = new Date(input.startsAt);
    const endsAt = new Date(input.endsAt);
    const minAdvanceMs = area.minAdvanceHours * MS_PER_HOUR;

    if (startsAt.getTime() - Date.now() < minAdvanceMs) {
      throw new BusinessRuleError(
        `Esta área exige pelo menos ${area.minAdvanceHours}h de antecedência para reservar.`,
      );
    }

    const overlapping = await this.bookings.findOverlapping(area.id, startsAt, endsAt, [
      ...ACTIVE_BOOKING_STATUSES,
    ]);

    if (overlapping.length > 0) {
      throw new BusinessRuleError(
        'Já existe uma reserva para este horário. Escolha outro período.',
      );
    }

    let booking = Booking.create({
      commonAreaId: area.id,
      condominiumId,
      unitNumber,
      residentAccountId,
      startsAt,
      endsAt,
      costSnapshotCents: area.costCents,
      acceptedRules: input.acceptRules,
      notes: input.notes,
    });

    if (area.autoApprove) {
      booking = booking.approve();
    }

    return BookingPresenter.toResponse(await this.bookings.save(booking));
  }
}
