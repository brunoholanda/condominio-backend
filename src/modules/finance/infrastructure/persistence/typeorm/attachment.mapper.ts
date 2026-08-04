import type { DeepPartial } from 'typeorm';

import type { AttachmentSnapshot } from '../../../domain/entities/attachment';
import { Attachment } from '../../../domain/entities/attachment';
import type { AttachmentOrmEntity } from './entities/attachment.orm-entity';

export class AttachmentMapper {
  static toDomain(row: AttachmentOrmEntity): Attachment {
    const snapshot: AttachmentSnapshot = {
      id: row.id,
      payableId: row.payableId,
      type: row.type,
      fileName: row.fileName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
      storageKey: row.storageKey,
      uploadedByUserId: row.uploadedByUserId,
      createdAt: row.createdAt,
    };

    return Attachment.restore(snapshot);
  }

  static toPersistence(attachment: Attachment): DeepPartial<AttachmentOrmEntity> {
    const snapshot = attachment.toSnapshot();

    return {
      id: snapshot.id,
      payableId: snapshot.payableId,
      type: snapshot.type,
      fileName: snapshot.fileName,
      mimeType: snapshot.mimeType,
      sizeBytes: snapshot.sizeBytes,
      storageKey: snapshot.storageKey,
      uploadedByUserId: snapshot.uploadedByUserId,
    };
  }
}
