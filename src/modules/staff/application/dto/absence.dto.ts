import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';

import { AbsenceReason, AbsenceStatus } from '../../domain/enums/staff.enums';

export class CreateAbsenceDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  employeeId: string;

  @ApiProperty({ enum: AbsenceReason })
  @IsEnum(AbsenceReason)
  reason: AbsenceReason;

  @ApiProperty({ example: '2026-08-04' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-08-04' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  notes?: string | null;
}

export class UpdateAbsenceDto extends PartialType(CreateAbsenceDto) {}

export class ReviewAbsenceDto {
  @ApiProperty({ enum: [AbsenceStatus.Approved, AbsenceStatus.Rejected] })
  @IsEnum(AbsenceStatus)
  status: AbsenceStatus.Approved | AbsenceStatus.Rejected;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  reviewNotes?: string | null;
}

export class ListAbsencesQueryDto {
  @ApiPropertyOptional({ description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({ enum: AbsenceReason })
  @IsOptional()
  @IsEnum(AbsenceReason)
  reason?: AbsenceReason;

  @ApiPropertyOptional({ enum: AbsenceStatus })
  @IsOptional()
  @IsEnum(AbsenceStatus)
  status?: AbsenceStatus;
}

export class AbsenceResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  condominiumId: string;

  @ApiProperty({ format: 'uuid' })
  employeeId: string;

  @ApiPropertyOptional()
  employeeName?: string;

  @ApiProperty({ enum: AbsenceReason })
  reason: AbsenceReason;

  @ApiProperty()
  reasonLabel: string;

  @ApiProperty()
  startDate: string;

  @ApiProperty()
  endDate: string;

  @ApiPropertyOptional({ nullable: true })
  notes: string | null;

  @ApiProperty({ enum: AbsenceStatus })
  status: AbsenceStatus;

  @ApiPropertyOptional({ nullable: true })
  attachmentStorageKey: string | null;

  @ApiProperty()
  hasAttachment: boolean;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  reviewedByUserId: string | null;

  @ApiPropertyOptional({ nullable: true })
  reviewedAt: string | null;

  @ApiPropertyOptional({ nullable: true })
  reviewNotes: string | null;

  @ApiProperty({ format: 'uuid' })
  createdByUserId: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
