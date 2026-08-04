import { randomUUID } from 'node:crypto';

import { BusinessRuleError } from '../../../../shared/domain/domain-error';
import { requireEnum, requireText } from '../../../../shared/domain/guards';
import { AttachmentType } from '../enums/attachment-type';

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

export interface AttachmentProps {
  payableId: string;
  type: AttachmentType | string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  uploadedByUserId: string;
}

export interface AttachmentSnapshot extends AttachmentProps {
  id: string;
  type: AttachmentType;
  createdAt: Date;
}

/** A file (invoice, contract, service note...) attached to a payable. */
export class Attachment {
  private constructor(private readonly state: AttachmentSnapshot) {}

  static create(props: AttachmentProps): Attachment {
    return new Attachment({ ...Attachment.parse(props), id: randomUUID(), createdAt: new Date() });
  }

  static restore(snapshot: AttachmentSnapshot): Attachment {
    return new Attachment({
      ...Attachment.parse(snapshot),
      id: snapshot.id,
      createdAt: snapshot.createdAt,
    });
  }

  private static parse(props: AttachmentProps): Omit<AttachmentSnapshot, 'id' | 'createdAt'> {
    const sizeBytes = Math.trunc(Number(props.sizeBytes));

    if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
      throw new BusinessRuleError('O arquivo enviado está vazio ou corrompido.');
    }

    if (sizeBytes > MAX_SIZE_BYTES) {
      throw new BusinessRuleError('O arquivo excede o limite de 20 MB por anexo.');
    }

    return {
      payableId: requireText('conta', props.payableId, { min: 1, max: 64 }),
      type: requireEnum('tipo de anexo', props.type, AttachmentType),
      fileName: requireText('nome do arquivo', props.fileName, { min: 1, max: 255 }),
      mimeType: requireText('tipo do arquivo', props.mimeType, { min: 1, max: 100 }),
      sizeBytes,
      storageKey: requireText('chave de armazenamento', props.storageKey, { min: 1, max: 500 }),
      uploadedByUserId: requireText('responsável', props.uploadedByUserId, { min: 1, max: 64 }),
    };
  }

  get id(): string {
    return this.state.id;
  }

  get storageKey(): string {
    return this.state.storageKey;
  }

  toSnapshot(): AttachmentSnapshot {
    return { ...this.state };
  }
}
