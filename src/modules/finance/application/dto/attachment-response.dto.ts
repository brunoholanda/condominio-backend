import { ApiProperty } from '@nestjs/swagger';

import { AttachmentType } from '../../domain/enums/attachment-type';

export class AttachmentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  payableId: string;

  @ApiProperty({ enum: AttachmentType })
  type: AttachmentType;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  sizeBytes: number;

  @ApiProperty({ format: 'uuid' })
  uploadedByUserId: string;

  @ApiProperty()
  createdAt: string;
}
