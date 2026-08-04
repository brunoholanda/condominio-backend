import type { Attachment } from '../entities/attachment';

export abstract class AttachmentRepository {
  abstract save(attachment: Attachment): Promise<Attachment>;

  abstract findById(id: string): Promise<Attachment | null>;

  abstract listByPayable(payableId: string): Promise<Attachment[]>;

  abstract delete(id: string): Promise<void>;
}
