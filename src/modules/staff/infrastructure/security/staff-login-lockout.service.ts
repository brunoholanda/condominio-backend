import { createHash, randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Column, Entity, PrimaryColumn, Repository, UpdateDateColumn } from 'typeorm';

import { AuthenticationError } from '../../../../shared/domain/domain-error';

@Entity('staff_login_lockouts')
export class StaffLoginLockoutOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'condominium_id', type: 'uuid' })
  condominiumId: string;

  @Column({ name: 'cpf_hash', type: 'varchar', length: 64 })
  cpfHash: string;

  @Column({ name: 'failed_attempts', type: 'int', default: 0 })
  failedAttempts: number;

  @Column({ name: 'locked_until', type: 'timestamptz', nullable: true })
  lockedUntil: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

/** Bloqueia tentativas de CPF+PIN após falhas consecutivas. */
@Injectable()
export class StaffLoginLockoutService {
  constructor(
    @InjectRepository(StaffLoginLockoutOrmEntity)
    private readonly repository: Repository<StaffLoginLockoutOrmEntity>,
  ) {}

  async assertNotLocked(condominiumId: string, cpfDigits: string): Promise<void> {
    const row = await this.find(condominiumId, cpfDigits);

    if (row?.lockedUntil && row.lockedUntil.getTime() > Date.now()) {
      const minutes = Math.ceil((row.lockedUntil.getTime() - Date.now()) / 60_000);
      throw new AuthenticationError(
        `Muitas tentativas inválidas. Tente novamente em cerca de ${minutes} minuto(s).`,
      );
    }
  }

  async registerFailure(condominiumId: string, cpfDigits: string): Promise<void> {
    const cpfHash = this.hashCpf(cpfDigits);
    let row = await this.repository.findOne({ where: { condominiumId, cpfHash } });

    if (!row) {
      row = this.repository.create({
        id: randomUUID(),
        condominiumId,
        cpfHash,
        failedAttempts: 0,
        lockedUntil: null,
      });
    }

    if (row.lockedUntil && row.lockedUntil.getTime() <= Date.now()) {
      row.failedAttempts = 0;
      row.lockedUntil = null;
    }

    row.failedAttempts += 1;

    if (row.failedAttempts >= MAX_ATTEMPTS) {
      row.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60_000);
      row.failedAttempts = 0;
    }

    await this.repository.save(row);
  }

  async registerSuccess(condominiumId: string, cpfDigits: string): Promise<void> {
    const cpfHash = this.hashCpf(cpfDigits);
    await this.repository.delete({ condominiumId, cpfHash });
  }

  private async find(condominiumId: string, cpfDigits: string) {
    return this.repository.findOne({
      where: { condominiumId, cpfHash: this.hashCpf(cpfDigits) },
    });
  }

  private hashCpf(cpfDigits: string): string {
    return createHash('sha256').update(cpfDigits).digest('hex');
  }
}
