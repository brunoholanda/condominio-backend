import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, Length } from 'class-validator';

import { VisitorPassStatus } from '../../domain/enums/visitor-pass-status';

export class CreateVisitorPassDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @Length(2, 150)
  visitorName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 40)
  visitorDocument?: string | null;

  @ApiProperty({ example: 'Maria Souza' })
  @IsString()
  @Length(2, 150)
  hostName: string;

  @ApiPropertyOptional({ example: '101' })
  @IsOptional()
  @IsString()
  @Length(1, 40)
  unitNumber?: string | null;

  @ApiProperty()
  @IsDateString()
  expectedAt: string;

  @ApiProperty()
  @IsDateString()
  expiresAt: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  notes?: string | null;
}

export class ListVisitorPassesQueryDto {
  @ApiPropertyOptional({ enum: VisitorPassStatus })
  @IsOptional()
  @IsEnum(VisitorPassStatus)
  status?: VisitorPassStatus;

  @ApiPropertyOptional({ description: 'ISO datetime' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO datetime' })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class VisitorPassResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  condominiumId: string;

  @ApiProperty()
  visitorName: string;

  @ApiPropertyOptional({ nullable: true })
  visitorDocument: string | null;

  @ApiProperty()
  hostName: string;

  @ApiPropertyOptional({ nullable: true })
  unitNumber: string | null;

  @ApiProperty()
  expectedAt: string;

  @ApiProperty()
  expiresAt: string;

  @ApiProperty({ enum: VisitorPassStatus })
  status: VisitorPassStatus;

  @ApiPropertyOptional({ nullable: true })
  notes: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  createdByUserId: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  createdByEmployeeId: string | null;

  @ApiPropertyOptional({ nullable: true })
  checkedInAt: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  checkedInByUserId: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  checkedInByEmployeeId: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
