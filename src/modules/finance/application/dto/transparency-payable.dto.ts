import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AttachmentType } from '../../domain/enums/attachment-type';

/** Conta paga exposta no portal da transparência (sem dados internos de auditoria). */
export class TransparencyPayableDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  vendor: string;

  @ApiProperty()
  category: string;

  @ApiProperty({ description: 'Valor em centavos' })
  amountCents: number;

  @ApiProperty({ example: '2026-09-10' })
  dueDate: string;

  @ApiPropertyOptional({ nullable: true })
  paidAt: string | null;

  @ApiPropertyOptional({ nullable: true })
  notes: string | null;

  @ApiProperty({ description: 'Quantidade de documentos anexados' })
  attachmentCount: number;
}

export class PaginatedTransparencyPayablesDto {
  @ApiProperty({ type: [TransparencyPayableDto] })
  items: TransparencyPayableDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class TransparencyAttachmentDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: AttachmentType })
  type: AttachmentType;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  sizeBytes: number;
}

export class TransparencyPayableDetailDto extends TransparencyPayableDto {
  @ApiProperty({ type: [TransparencyAttachmentDto] })
  attachments: TransparencyAttachmentDto[];
}
