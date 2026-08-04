import { Injectable, NotFoundException } from '@nestjs/common';

import { ChargeStatusHistory } from '../../domain/entities/charge-status-history';
import { ChargeStatus } from '../../domain/enums/charge-status';
import { ChargeRepository } from '../../domain/repositories/charge.repository';
import { ChargeStatusHistoryRepository } from '../../domain/repositories/charge-status-history.repository';
import { CondoAsaasSettingsRepository } from '../../domain/repositories/condo-asaas-settings.repository';
import { AsaasClient } from '../../infrastructure/asaas/asaas.client';
import type { ChargeResponseDto } from '../dto/charge-response.dto';
import type { CancelChargeDto } from '../dto/receivables.dto';
import { ChargePresenter } from '../presenters/charge.presenter';

@Injectable()
export class CancelChargeUseCase {
  constructor(
    private readonly charges: ChargeRepository,
    private readonly history: ChargeStatusHistoryRepository,
    private readonly settings: CondoAsaasSettingsRepository,
    private readonly asaas: AsaasClient,
  ) {}

  async execute(
    id: string,
    condominiumId: string,
    userId: string,
    input: CancelChargeDto,
  ): Promise<ChargeResponseDto> {
    const charge = await this.charges.findById(id, condominiumId);

    if (!charge) {
      throw new NotFoundException('Cobrança não encontrada.');
    }

    const fromStatus = charge.status;
    const asaasPaymentId = charge.asaasPaymentId;
    const settings = await this.settings.findByCondominiumId(condominiumId);

    if (asaasPaymentId && settings) {
      try {
        await this.asaas.deletePayment(settings.apiKey, asaasPaymentId);
      } catch {
        /* Cobrança local ainda pode ser cancelada se o Asaas já a removeu. */
      }
    }

    const cancelled = await this.charges.save(charge.cancel());

    await this.history.save(
      ChargeStatusHistory.create({
        chargeId: cancelled.id,
        fromStatus,
        toStatus: ChargeStatus.Cancelled,
        changedByUserId: userId,
        note: input.note ?? 'Cobrança cancelada pelo gestor',
      }),
    );

    return ChargePresenter.toResponse(cancelled);
  }
}
