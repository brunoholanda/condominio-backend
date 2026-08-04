import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DocumentType } from '../../domain/enums/document-type';

export class DocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  condominiumId: string;

  @ApiProperty({ enum: DocumentType })
  type: DocumentType;

  @ApiProperty()
  title: string;

  @ApiProperty()
  body: string;

  @ApiPropertyOptional()
  storageKey: string | null;

  @ApiProperty()
  isPublic: boolean;

  @ApiPropertyOptional()
  publishedAt: Date | null;

  @ApiProperty()
  createdByUserId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
