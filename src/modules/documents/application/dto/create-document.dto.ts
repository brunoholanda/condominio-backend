import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, Length } from 'class-validator';

import { DocumentType } from '../../domain/enums/document-type';

export class CreateDocumentDto {
  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty({ minLength: 3, maxLength: 200 })
  @IsString()
  @Length(3, 200)
  title: string;

  @ApiProperty({ maxLength: 20000 })
  @IsString()
  @Length(1, 20000)
  body: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ description: 'Data de publicação (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
