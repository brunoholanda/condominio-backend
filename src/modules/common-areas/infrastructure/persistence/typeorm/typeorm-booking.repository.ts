import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import type { Booking } from '../../../domain/entities/booking';
import type { BookingFilters } from '../../../domain/repositories/booking.repository';
import { BookingRepository } from '../../../domain/repositories/booking.repository';
import type { BookingStatus } from '../../../domain/enums/booking-status';
import { BookingOrmEntity } from './entities/booking.orm-entity';
import { BookingMapper } from './booking.mapper';

@Injectable()
export class TypeormBookingRepository extends BookingRepository {
  constructor(
    @InjectRepository(BookingOrmEntity)
    private readonly repository: Repository<BookingOrmEntity>,
  ) {
    super();
  }

  async save(booking: Booking): Promise<Booking> {
    await this.repository.save(BookingMapper.toPersistence(booking));

    const row = await this.repository.findOne({ where: { id: booking.id } });

    if (!row) {
      throw new Error(`Falha ao persistir a reserva ${booking.id}.`);
    }

    return BookingMapper.toDomain(row);
  }

  async findById(id: string, condominiumId: string): Promise<Booking | null> {
    const row = await this.repository.findOne({ where: { id, condominiumId } });

    return row ? BookingMapper.toDomain(row) : null;
  }

  async findManyByCondo(condominiumId: string, filters: BookingFilters = {}): Promise<Booking[]> {
    const rows = await this.repository.find({
      where: {
        condominiumId,
        ...(filters.commonAreaId ? { commonAreaId: filters.commonAreaId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      order: { startsAt: 'DESC' },
    });

    return rows.map((row) => BookingMapper.toDomain(row));
  }

  async findManyByResident(residentId: string): Promise<Booking[]> {
    const rows = await this.repository.find({
      where: { residentId },
      order: { startsAt: 'DESC' },
    });

    return rows.map((row) => BookingMapper.toDomain(row));
  }

  async findOverlapping(
    commonAreaId: string,
    startsAt: Date,
    endsAt: Date,
    statuses: BookingStatus[],
    excludeBookingId?: string,
  ): Promise<Booking[]> {
    const builder = this.repository
      .createQueryBuilder('booking')
      .where('booking.commonAreaId = :commonAreaId', { commonAreaId })
      .andWhere('booking.status IN (:...statuses)', { statuses })
      .andWhere('booking.startsAt < :endsAt', { endsAt })
      .andWhere('booking.endsAt > :startsAt', { startsAt });

    if (excludeBookingId) {
      builder.andWhere('booking.id != :excludeBookingId', { excludeBookingId });
    }

    const rows = await builder.getMany();

    return rows.map((row) => BookingMapper.toDomain(row));
  }
}
