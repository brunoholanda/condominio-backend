import { randomUUID } from 'node:crypto';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { optionalText, requireDate, requireText } from '../../../../shared/domain/guards';
import { ChargeStatus } from '../enums/charge-status';

export interface ChargeProps {
  condominiumId: string;
  batchId?: string | null;
  unitNumber: string;
  residentId?: string | null;
  payerName: string;
  payerCpf?: string | null;
  description: string;
  amountCents: number;
  dueDate: Date | string;
  createdByUserId: string;
}

export interface ChargePixData {
  asaasPaymentId: string;
  asaasCustomerId: string | null;
  pixPayload: string | null;
  pixQrCodeBase64: string | null;
  pixExpirationDate: Date | null;
  invoiceUrl: string | null;
}

export interface ChargeSnapshot extends ChargeProps {
  id: string;
  batchId: string | null;
  residentId: string | null;
  payerCpf: string | null;
  dueDate: Date;
  status: ChargeStatus;
  asaasPaymentId: string | null;
  asaasCustomerId: string | null;
  pixPayload: string | null;
  pixQrCodeBase64: string | null;
  pixExpirationDate: Date | null;
  invoiceUrl: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ChargeState {
  id: string;
  condominiumId: string;
  batchId: string | null;
  unitNumber: string;
  residentId: string | null;
  payerName: string;
  payerCpf: string | null;
  description: string;
  amountCents: number;
  dueDate: Date;
  status: ChargeStatus;
  asaasPaymentId: string | null;
  asaasCustomerId: string | null;
  pixPayload: string | null;
  pixQrCodeBase64: string | null;
  pixExpirationDate: Date | null;
  invoiceUrl: string | null;
  paidAt: Date | null;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Fatura PIX cobrada de uma unidade do condomínio. */
export class Charge {
  private constructor(private readonly state: ChargeState) {}

  static create(props: ChargeProps): Charge {
    const now = new Date();

    return new Charge({
      ...Charge.parse(props),
      id: randomUUID(),
      status: ChargeStatus.Pending,
      asaasPaymentId: null,
      asaasCustomerId: null,
      pixPayload: null,
      pixQrCodeBase64: null,
      pixExpirationDate: null,
      invoiceUrl: null,
      paidAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(snapshot: ChargeSnapshot): Charge {
    return new Charge({
      ...Charge.parse(snapshot),
      id: snapshot.id,
      status: snapshot.status,
      asaasPaymentId: snapshot.asaasPaymentId,
      asaasCustomerId: snapshot.asaasCustomerId,
      pixPayload: snapshot.pixPayload,
      pixQrCodeBase64: snapshot.pixQrCodeBase64,
      pixExpirationDate: snapshot.pixExpirationDate,
      invoiceUrl: snapshot.invoiceUrl,
      paidAt: snapshot.paidAt,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  withPix(data: ChargePixData): Charge {
    this.ensurePending('vincular PIX');

    return new Charge({
      ...this.state,
      asaasPaymentId: requireText('pagamento Asaas', data.asaasPaymentId, { min: 1, max: 64 }),
      asaasCustomerId: optionalText('cliente Asaas', data.asaasCustomerId, { min: 1, max: 64 }),
      pixPayload: optionalText('payload PIX', data.pixPayload, { min: 1, max: 1000 }),
      pixQrCodeBase64: data.pixQrCodeBase64?.trim() || null,
      pixExpirationDate: data.pixExpirationDate,
      invoiceUrl: optionalText('URL da fatura', data.invoiceUrl, { min: 1, max: 500 }),
      updatedAt: new Date(),
    });
  }

  markAsPaid(paidAt: Date = new Date()): Charge {
    if (this.state.status === ChargeStatus.Paid) {
      return this;
    }

    if (this.state.status === ChargeStatus.Cancelled) {
      throw new BusinessRuleError('Não é possível marcar como paga uma cobrança cancelada.');
    }

    return new Charge({
      ...this.state,
      status: ChargeStatus.Paid,
      paidAt,
      updatedAt: new Date(),
    });
  }

  cancel(): Charge {
    this.ensurePending('cancelar');

    return new Charge({
      ...this.state,
      status: ChargeStatus.Cancelled,
      updatedAt: new Date(),
    });
  }

  private ensurePending(action: string): void {
    if (this.state.status !== ChargeStatus.Pending) {
      throw new BusinessRuleError(
        `Só é possível ${action} uma cobrança pendente. Esta já está ${Charge.statusLabel(this.state.status)}.`,
      );
    }
  }

  private static statusLabel(status: ChargeStatus): string {
    return status === ChargeStatus.Paid ? 'paga' : 'cancelada';
  }

  private static parse(
    props: ChargeProps,
  ): Omit<
    ChargeState,
    | 'id'
    | 'status'
    | 'asaasPaymentId'
    | 'asaasCustomerId'
    | 'pixPayload'
    | 'pixQrCodeBase64'
    | 'pixExpirationDate'
    | 'invoiceUrl'
    | 'paidAt'
    | 'createdAt'
    | 'updatedAt'
  > {
    const amountCents = Math.trunc(Number(props.amountCents));

    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      throw new BusinessRuleError('O valor da cobrança deve ser maior que zero.');
    }

    const payerCpf = optionalText('CPF', props.payerCpf, { min: 11, max: 11 });

    return {
      condominiumId: requireText('condomínio', props.condominiumId, { min: 1, max: 64 }),
      batchId: optionalText('lote', props.batchId, { min: 1, max: 64 }),
      unitNumber: requireText('unidade', props.unitNumber, { min: 1, max: 20 }),
      residentId: optionalText('morador', props.residentId, { min: 1, max: 64 }),
      payerName: requireText('pagador', props.payerName, { min: 2, max: 150 }),
      payerCpf,
      description: requireText('descrição', props.description, { min: 3, max: 200 }),
      amountCents,
      dueDate: requireDate('data de vencimento', props.dueDate),
      createdByUserId: requireText('responsável', props.createdByUserId, { min: 1, max: 64 }),
    };
  }

  get id(): string {
    return this.state.id;
  }

  get condominiumId(): string {
    return this.state.condominiumId;
  }

  get status(): ChargeStatus {
    return this.state.status;
  }

  get asaasPaymentId(): string | null {
    return this.state.asaasPaymentId;
  }

  get createdByUserId(): string {
    return this.state.createdByUserId;
  }

  get unitNumber(): string {
    return this.state.unitNumber;
  }

  toSnapshot(): ChargeSnapshot {
    const { state } = this;

    return {
      id: state.id,
      condominiumId: state.condominiumId,
      batchId: state.batchId,
      unitNumber: state.unitNumber,
      residentId: state.residentId,
      payerName: state.payerName,
      payerCpf: state.payerCpf,
      description: state.description,
      amountCents: state.amountCents,
      dueDate: state.dueDate,
      status: state.status,
      asaasPaymentId: state.asaasPaymentId,
      asaasCustomerId: state.asaasCustomerId,
      pixPayload: state.pixPayload,
      pixQrCodeBase64: state.pixQrCodeBase64,
      pixExpirationDate: state.pixExpirationDate,
      invoiceUrl: state.invoiceUrl,
      paidAt: state.paidAt,
      createdByUserId: state.createdByUserId,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    };
  }
}
