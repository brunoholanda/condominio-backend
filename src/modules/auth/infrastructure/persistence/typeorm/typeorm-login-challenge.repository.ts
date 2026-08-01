import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Not, Repository } from 'typeorm';

import { LoginChallenge } from '../../../domain/entities/login-challenge';
import { LoginChallengeRepository } from '../../../domain/repositories/login-challenge.repository';
import { LoginChallengeOrmEntity } from './entities/login-challenge.orm-entity';

@Injectable()
export class TypeormLoginChallengeRepository extends LoginChallengeRepository {
  constructor(
    @InjectRepository(LoginChallengeOrmEntity)
    private readonly repository: Repository<LoginChallengeOrmEntity>,
  ) {
    super();
  }

  async save(challenge: LoginChallenge): Promise<LoginChallenge> {
    const { createdAt: _createdAt, ...row } = challenge.toSnapshot();

    await this.repository.save(row);

    return challenge;
  }

  async findById(id: string): Promise<LoginChallenge | null> {
    const row = await this.repository.findOne({ where: { id } });

    return row ? LoginChallenge.restore(row) : null;
  }

  async discardFor(userId: string): Promise<void> {
    await this.repository.delete({ userId });
    // Aproveita a visita para varrer o lixo deixado por logins abandonados.
    await this.repository.delete({ userId: Not(userId), expiresAt: LessThanOrEqual(new Date()) });
  }
}
