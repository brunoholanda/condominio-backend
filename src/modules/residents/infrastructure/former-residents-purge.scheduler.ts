import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PurgeExpiredFormerResidentsUseCase } from '../application/use-cases/former-resident-queries.use-case';

@Injectable()
export class FormerResidentsPurgeScheduler {
  private readonly logger = new Logger(FormerResidentsPurgeScheduler.name);

  constructor(private readonly purge: PurgeExpiredFormerResidentsUseCase) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async runDailyPurge(): Promise<void> {
    const { deleted } = await this.purge.execute();

    if (deleted > 0) {
      this.logger.log(`Purged ${deleted} expired former resident record(s).`);
    }
  }
}
