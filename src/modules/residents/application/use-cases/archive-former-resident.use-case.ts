import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { EnvironmentVariables } from '../../../../config/environment';
import type { Resident } from '../../domain/entities/resident';
import {
  FormerResidentRecord,
  type FormerResidentReason,
} from '../../domain/entities/former-resident';
import { FormerResidentRepository } from '../../domain/repositories/former-resident.repository';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class ArchiveFormerResidentUseCase {
  constructor(
    private readonly formerResidents: FormerResidentRepository,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async execute(
    resident: Resident,
    reason: FormerResidentReason,
    supersededByUserId: string | null,
  ): Promise<FormerResidentRecord> {
    const retentionDays =
      this.config.get('FORMER_RESIDENT_RETENTION_DAYS', { infer: true }) ?? 1825;
    const supersededAt = new Date();
    const retainUntil = new Date(supersededAt.getTime() + retentionDays * MS_PER_DAY);
    const snapshot = resident.toSnapshot();

    return this.formerResidents.save(
      FormerResidentRecord.create({
        condominiumId: snapshot.condominiumId,
        unit: snapshot.unit,
        sourceResidentId: snapshot.id,
        reason,
        payload: snapshot,
        supersededAt,
        retainUntil,
        supersededByUserId,
      }),
    );
  }
}
