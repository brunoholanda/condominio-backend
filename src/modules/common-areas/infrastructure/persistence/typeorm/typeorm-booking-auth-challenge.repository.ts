import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { BookingAuthChallenge } from '../../../domain/entities/booking-auth-challenge';
import { BookingAuthChallengeRepository } from '../../../domain/repositories/booking-auth-challenge.repository';
import { BookingAuthChallengeOrmEntity } from './entities/booking-auth-challenge.orm-entity';

@Injectable()
export class TypeormBookingAuthChallengeRepository extends BookingAuthChallengeRepository {
  constructor(
    @InjectRepository(BookingAuthChallengeOrmEntity)
    private readonly rows: Repository<BookingAuthChallengeOrmEntity>,
  ) {
    super();
  }

  async save(challenge: BookingAuthChallenge): Promise<BookingAuthChallenge> {
    const snapshot = challenge.toSnapshot();
    await this.rows.save({
      id: snapshot.id,
      condominiumId: snapshot.condominiumId,
      residentId: snapshot.residentId,
      codeHash: snapshot.codeHash,
      expiresAt: snapshot.expiresAt,
      attempts: snapshot.attempts,
      resends: snapshot.resends,
      consumedAt: snapshot.consumedAt,
      createdAt: snapshot.createdAt,
    });

    return challenge;
  }

  async findById(id: string): Promise<BookingAuthChallenge | null> {
    const row = await this.rows.findOne({ where: { id } });

    return row
      ? BookingAuthChallenge.restore({
          id: row.id,
          condominiumId: row.condominiumId,
          residentId: row.residentId,
          codeHash: row.codeHash,
          expiresAt: row.expiresAt,
          attempts: row.attempts,
          resends: row.resends,
          consumedAt: row.consumedAt,
          createdAt: row.createdAt,
        })
      : null;
  }

  async discardActiveForResident(residentId: string, condominiumId: string): Promise<void> {
    await this.rows.update(
      { residentId, condominiumId, consumedAt: IsNull() },
      { consumedAt: new Date() },
    );
  }
}
