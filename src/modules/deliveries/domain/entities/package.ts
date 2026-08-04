import { randomUUID } from 'node:crypto';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { optionalText, requireEnum, requireText } from '../../../../shared/domain/guards';
import { SignatureImage } from '../../../../shared/domain/value-objects/signature-image';
import { PackageStatus } from '../enums/package-status';

export interface PackageProps {
  condominiumId: string;
  unitNumber: string;
  description: string;
  carrier?: string | null;
  notes?: string | null;
  receivedByUserId: string;
}

export interface DeliverPackageProps {
  recipientName: string;
  signature: string;
  deliveredByUserId: string;
}

export interface PackageSnapshot {
  id: string;
  condominiumId: string;
  unitNumber: string;
  description: string;
  carrier: string | null;
  status: PackageStatus;
  receivedAt: Date;
  receivedByUserId: string;
  deliveredAt: Date | null;
  deliveredByUserId: string | null;
  recipientName: string | null;
  signature: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PackageState {
  id: string;
  condominiumId: string;
  unitNumber: string;
  description: string;
  carrier: string | null;
  status: PackageStatus;
  receivedAt: Date;
  receivedByUserId: string;
  deliveredAt: Date | null;
  deliveredByUserId: string | null;
  recipientName: string | null;
  signature: SignatureImage | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Parcel waiting at (or already handed over by) the lobby. */
export class Package {
  private constructor(private readonly state: PackageState) {}

  static create(props: PackageProps): Package {
    const now = new Date();

    return new Package({
      id: randomUUID(),
      condominiumId: requireText('condomínio', props.condominiumId, { min: 1, max: 64 }),
      unitNumber: requireText('unidade', props.unitNumber, { min: 1, max: 20 }),
      description: requireText('descrição', props.description, { min: 2, max: 200 }),
      carrier: optionalText('transportadora', props.carrier, { min: 2, max: 100 }),
      notes: optionalText('observações', props.notes, { min: 1, max: 2000 }),
      status: PackageStatus.Waiting,
      receivedAt: now,
      receivedByUserId: requireText('recebido por', props.receivedByUserId, { min: 1, max: 64 }),
      deliveredAt: null,
      deliveredByUserId: null,
      recipientName: null,
      signature: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(snapshot: PackageSnapshot): Package {
    return new Package({
      id: snapshot.id,
      condominiumId: snapshot.condominiumId,
      unitNumber: snapshot.unitNumber,
      description: snapshot.description,
      carrier: snapshot.carrier,
      status: requireEnum('status', snapshot.status, PackageStatus),
      receivedAt: snapshot.receivedAt,
      receivedByUserId: snapshot.receivedByUserId,
      deliveredAt: snapshot.deliveredAt,
      deliveredByUserId: snapshot.deliveredByUserId,
      recipientName: snapshot.recipientName,
      signature: snapshot.signature ? SignatureImage.create(snapshot.signature) : null,
      notes: snapshot.notes,
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
    });
  }

  /** Protocols the handover: signature is dated by the server clock. */
  deliver(props: DeliverPackageProps): Package {
    if (this.state.status !== PackageStatus.Waiting) {
      throw new BusinessRuleError('Esta encomenda já foi entregue.');
    }

    const now = new Date();

    return new Package({
      ...this.state,
      status: PackageStatus.Delivered,
      deliveredAt: now,
      deliveredByUserId: requireText('entregue por', props.deliveredByUserId, {
        min: 1,
        max: 64,
      }),
      recipientName: requireText('nome de quem retirou', props.recipientName, {
        min: 3,
        max: 150,
      }),
      signature: SignatureImage.create(props.signature),
      updatedAt: now,
    });
  }

  get id(): string {
    return this.state.id;
  }

  get condominiumId(): string {
    return this.state.condominiumId;
  }

  get status(): PackageStatus {
    return this.state.status;
  }

  get unitNumber(): string {
    return this.state.unitNumber;
  }

  toSnapshot(): PackageSnapshot {
    return {
      id: this.state.id,
      condominiumId: this.state.condominiumId,
      unitNumber: this.state.unitNumber,
      description: this.state.description,
      carrier: this.state.carrier,
      status: this.state.status,
      receivedAt: this.state.receivedAt,
      receivedByUserId: this.state.receivedByUserId,
      deliveredAt: this.state.deliveredAt,
      deliveredByUserId: this.state.deliveredByUserId,
      recipientName: this.state.recipientName,
      signature: this.state.signature?.value ?? null,
      notes: this.state.notes,
      createdAt: this.state.createdAt,
      updatedAt: this.state.updatedAt,
    };
  }
}
