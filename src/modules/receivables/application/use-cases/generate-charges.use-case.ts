import { Injectable } from '@nestjs/common';

import { toIsoDate } from '../../../../shared/application/date-format';
import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { CondominiumRepository } from '../../../condominiums/domain/repositories/condominium.repository';
import { ResidentRepository } from '../../../residents/domain/repositories/resident.repository';
import { Charge } from '../../domain/entities/charge';
import { ChargeBatch } from '../../domain/entities/charge-batch';
import { ChargeStatusHistory } from '../../domain/entities/charge-status-history';
import { ChargeStatus } from '../../domain/enums/charge-status';
import { ChargeBatchRepository } from '../../domain/repositories/charge-batch.repository';
import { ChargeRepository } from '../../domain/repositories/charge.repository';
import { ChargeStatusHistoryRepository } from '../../domain/repositories/charge-status-history.repository';
import { AsaasClient } from '../../infrastructure/asaas/asaas.client';
import type { GenerateChargesResultDto } from '../dto/charge-response.dto';
import type { GenerateChargesDto } from '../dto/receivables.dto';
import { ChargePresenter } from '../presenters/charge.presenter';
import { RequireAsaasSettingsUseCase } from './asaas-settings.use-case';

@Injectable()
export class GenerateChargesUseCase {
  constructor(
    private readonly requireSettings: RequireAsaasSettingsUseCase,
    private readonly condominiums: CondominiumRepository,
    private readonly residents: ResidentRepository,
    private readonly batches: ChargeBatchRepository,
    private readonly charges: ChargeRepository,
    private readonly history: ChargeStatusHistoryRepository,
    private readonly asaas: AsaasClient,
  ) {}

  async execute(
    condominiumId: string,
    userId: string,
    input: GenerateChargesDto,
  ): Promise<GenerateChargesResultDto> {
    const settings = await this.requireSettings.execute(condominiumId);
    const catalog = await this.condominiums.listUnitNumbers(condominiumId);
    const catalogSet = new Set(catalog);
    const uniqueUnits = [...new Set(input.unitNumbers.map((unit) => unit.trim()).filter(Boolean))];

    if (uniqueUnits.length === 0) {
      throw new BusinessRuleError('Selecione ao menos uma unidade.');
    }

    for (const unit of uniqueUnits) {
      if (!catalogSet.has(unit)) {
        throw new BusinessRuleError(`A unidade ${unit} não pertence ao catálogo deste condomínio.`);
      }
    }

    const batch = await this.batches.save(
      ChargeBatch.create({
        condominiumId,
        referenceMonth: input.referenceMonth,
        description: input.description,
        dueDate: input.dueDate,
        defaultAmountCents: input.amountCents,
        createdByUserId: userId,
      }),
    );

    const created: Charge[] = [];
    const failures: Array<{ unitNumber: string; error: string }> = [];
    const apiKey = settings.apiKey;

    for (const unitNumber of uniqueUnits) {
      try {
        const residentId = await this.residents.findIdByUnit(unitNumber, condominiumId);
        const resident = residentId
          ? await this.residents.findById(residentId, condominiumId)
          : null;

        const payerName = resident?.fullName ?? `Unidade ${unitNumber}`;
        const payerCpf = resident?.cpf.value ?? null;

        let charge = Charge.create({
          condominiumId,
          batchId: batch.id,
          unitNumber,
          residentId,
          payerName,
          payerCpf,
          description: input.description,
          amountCents: input.amountCents,
          dueDate: input.dueDate,
          createdByUserId: userId,
        });

        const customer = await this.asaas.createCustomer(apiKey, {
          name: payerName,
          cpfCnpj: payerCpf,
          externalReference: `${condominiumId}:${unitNumber}`,
        });

        const payment = await this.asaas.createPixPayment(apiKey, {
          customerId: customer.id,
          valueReais: input.amountCents / 100,
          dueDate: toIsoDate(new Date(input.dueDate)),
          description: `${input.description} · Unidade ${unitNumber}`,
          externalReference: charge.id,
        });

        const qr = await this.asaas.getPixQrCode(apiKey, payment.id);

        charge = charge.withPix({
          asaasPaymentId: payment.id,
          asaasCustomerId: customer.id,
          pixPayload: qr.payload,
          pixQrCodeBase64: qr.encodedImage,
          pixExpirationDate: qr.expirationDate ? new Date(qr.expirationDate) : null,
          invoiceUrl: payment.invoiceUrl,
        });

        const saved = await this.charges.save(charge);
        await this.history.save(
          ChargeStatusHistory.create({
            chargeId: saved.id,
            fromStatus: null,
            toStatus: ChargeStatus.Pending,
            changedByUserId: userId,
            note: 'Cobrança PIX gerada via Asaas',
          }),
        );

        created.push(saved);
      } catch (error: unknown) {
        const message =
          error instanceof BusinessRuleError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Falha ao gerar cobrança.';

        failures.push({ unitNumber, error: message });
      }
    }

    return {
      batchId: batch.id,
      created: created.map((charge) => ChargePresenter.toResponse(charge)),
      failures,
    };
  }
}
