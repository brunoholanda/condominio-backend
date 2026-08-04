import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

import { AttachmentType } from '../../../../domain/enums/attachment-type';

@Entity('attachments')
export class AttachmentOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Index('idx_attachments_payable')
  @Column({ name: 'payable_id', type: 'uuid' })
  payableId: string;

  @Column({ name: 'type', type: 'varchar', length: 20 })
  type: AttachmentType;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ name: 'size_bytes', type: 'int' })
  sizeBytes: number;

  @Column({ name: 'storage_key', type: 'varchar', length: 500 })
  storageKey: string;

  @Column({ name: 'uploaded_by_user_id', type: 'uuid' })
  uploadedByUserId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
