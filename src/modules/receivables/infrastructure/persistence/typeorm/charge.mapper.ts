import type { DeepPartial } from 'typeorm';

import { toIsoDate } from '../../../../../shared/application/date-format';
import type { ChargeSnapshot } from '../../../domain/entities/charge';
import { Charge } from '../../../domain/entities/charge';
import type { ChargeOrmEntity } from './entities/charge.orm-entity';

export class ChargeMapper {
  static toDomain(row: ChargeOrmEntity): Charge {
    const snapshot: ChargeSnapshot = {
      id: row.id,
      condominiumId: row.condominiumId,
      batchId: row.batchId,
      unitNumber: row.unitNumber,
      residentId: row.residentId,
      payerName: row.payerName,
      payerCpf: row.payerCpf,
      description: row.description,
      amountCents: row.amountCents,
      dueDate: new Date(row.dueDate),
      status: row.status,
      asaasPaymentId: row.asaasPaymentId,
      asaasCustomerId: row.asaasCustomerId,
      pixPayload: row.pixPayload,
      pixQrCodeBase64: row.pixQrCodeBase64,
      pixExpirationDate: row.pixExpirationDate,
      invoiceUrl: row.invoiceUrl,
      paidAt: row.paidAt,
      createdByUserId: row.createdByUserId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    return Charge.restore(snapshot);
  }

  static toPersistence(charge: Charge): DeepPartial<ChargeOrmEntity> {
    const snapshot = charge.toSnapshot();

    return {
      id: snapshot.id,
      condominiumId: snapshot.condominiumId,
      batchId: snapshot.batchId,
      unitNumber: snapshot.unitNumber,
      residentId: snapshot.residentId,
      payerName: snapshot.payerName,
      payerCpf: snapshot.payerCpf,
      description: snapshot.description,
      amountCents: snapshot.amountCents,
      dueDate: toIsoDate(snapshot.dueDate),
      status: snapshot.status,
      asaasPaymentId: snapshot.asaasPaymentId,
      asaasCustomerId: snapshot.asaasCustomerId,
      pixPayload: snapshot.pixPayload,
      pixQrCodeBase64: snapshot.pixQrCodeBase64,
      pixExpirationDate: snapshot.pixExpirationDate,
      invoiceUrl: snapshot.invoiceUrl,
      paidAt: snapshot.paidAt,
      createdByUserId: snapshot.createdByUserId,
    };
  }
}
