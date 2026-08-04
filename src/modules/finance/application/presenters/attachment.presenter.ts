import type { Attachment } from '../../domain/entities/attachment';
import type { AttachmentResponseDto } from '../dto/attachment-response.dto';

export class AttachmentPresenter {
  static toResponse(attachment: Attachment): AttachmentResponseDto {
    const snapshot = attachment.toSnapshot();

    return {
      id: snapshot.id,
      payableId: snapshot.payableId,
      type: snapshot.type,
      fileName: snapshot.fileName,
      mimeType: snapshot.mimeType,
      sizeBytes: snapshot.sizeBytes,
      uploadedByUserId: snapshot.uploadedByUserId,
      createdAt: snapshot.createdAt.toISOString(),
    };
  }
}
