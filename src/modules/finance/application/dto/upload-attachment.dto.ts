import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { AttachmentType } from '../../domain/enums/attachment-type';

/** Sent as a form field alongside the `file` part of the multipart upload. */
export class UploadAttachmentDto {
  @ApiProperty({ enum: AttachmentType, example: AttachmentType.Invoice })
  @IsEnum(AttachmentType)
  type: AttachmentType;
}
