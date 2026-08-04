import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { EnvironmentVariables } from '../../../../config/environment';
import { ChargeStatusHistory } from '../../domain/entities/charge-status-history';
import { ChargeStatus } from '../../domain/enums/charge-status';
import { ChargeRepository } from '../../domain/repositories/charge.repository';
import { ChargeStatusHistoryRepository } from '../../domain/repositories/charge-status-history.repository';

interface AsaasWebhookBody {
  event?: string;
  payment?: {
    id?: string;
    status?: string;
    paymentDate?: string;
    clientPaymentDate?: string;
  };
}

const PAID_EVENTS = new Set(['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED']);

const CANCEL_EVENTS = new Set(['PAYMENT_DELETED', 'PAYMENT_REFUNDED']);

@Injectable()
export class HandleAsaasWebhookUseCase {
  constructor(
    private readonly config: ConfigService<EnvironmentVariables, true>,
    private readonly charges: ChargeRepository,
    private readonly history: ChargeStatusHistoryRepository,
  ) {}

  async execute(accessToken: string | undefined, body: AsaasWebhookBody): Promise<void> {
    const expected = this.config.get('ASAAS_WEBHOOK_TOKEN', { infer: true })?.trim();

    if (!expected || accessToken !== expected) {
      throw new UnauthorizedException('Token do webhook Asaas inválido.');
    }

    const paymentId = body.payment?.id?.trim();
    const event = body.event?.trim();

    if (!paymentId || !event) {
      return;
    }

    const charge = await this.charges.findByAsaasPaymentId(paymentId);

    if (!charge) {
      return;
    }

    if (PAID_EVENTS.has(event) || body.payment?.status === 'RECEIVED' || body.payment?.status === 'CONFIRMED') {
      if (charge.status === ChargeStatus.Paid) {
        return;
      }

      const fromStatus = charge.status;
      const paidAtRaw = body.payment?.paymentDate || body.payment?.clientPaymentDate;
      const paidAt = paidAtRaw ? new Date(paidAtRaw) : new Date();
      const saved = await this.charges.save(charge.markAsPaid(paidAt));

      await this.history.save(
        ChargeStatusHistory.create({
          chargeId: saved.id,
          fromStatus,
          toStatus: ChargeStatus.Paid,
          changedByUserId: null,
          note: `Asaas webhook ${event}`,
        }),
      );

      return;
    }

    if (CANCEL_EVENTS.has(event) && charge.status === ChargeStatus.Pending) {
      const fromStatus = charge.status;
      const saved = await this.charges.save(charge.cancel());

      await this.history.save(
        ChargeStatusHistory.create({
          chargeId: saved.id,
          fromStatus,
          toStatus: ChargeStatus.Cancelled,
          changedByUserId: null,
          note: `Asaas webhook ${event}`,
        }),
      );
    }
  }
}
