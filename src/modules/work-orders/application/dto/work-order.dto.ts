import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

import {
  WorkOrderCategory,
  WorkOrderPriority,
  WorkOrderStatus,
} from '../../domain/enums/work-order.enums';

export class CreateWorkOrderDto {
  @ApiProperty()
  @IsString()
  @Length(3, 200)
  title: string;

  @ApiProperty()
  @IsString()
  @Length(5, 5000)
  description: string;

  @ApiProperty({ enum: WorkOrderCategory })
  @IsEnum(WorkOrderCategory)
  category: WorkOrderCategory;

  @ApiPropertyOptional({ enum: WorkOrderPriority, default: WorkOrderPriority.Normal })
  @IsOptional()
  @IsEnum(WorkOrderPriority)
  priority?: WorkOrderPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 40)
  unitNumber?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 150)
  reporterName?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 150)
  assignedTo?: string | null;
}

export class UpdateWorkOrderStatusDto {
  @ApiProperty({ enum: WorkOrderStatus })
  @IsEnum(WorkOrderStatus)
  status: WorkOrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 150)
  assignedTo?: string | null;
}

export class ListWorkOrdersQueryDto {
  @ApiPropertyOptional({ enum: WorkOrderStatus })
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  status?: WorkOrderStatus;

  @ApiPropertyOptional({ enum: WorkOrderCategory })
  @IsOptional()
  @IsEnum(WorkOrderCategory)
  category?: WorkOrderCategory;
}

export class WorkOrderResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  condominiumId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: WorkOrderCategory })
  category: WorkOrderCategory;

  @ApiProperty({ enum: WorkOrderPriority })
  priority: WorkOrderPriority;

  @ApiProperty({ enum: WorkOrderStatus })
  status: WorkOrderStatus;

  @ApiPropertyOptional({ nullable: true })
  unitNumber: string | null;

  @ApiPropertyOptional({ nullable: true })
  reporterName: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  createdByUserId: string | null;

  @ApiPropertyOptional({ nullable: true })
  assignedTo: string | null;

  @ApiPropertyOptional({ nullable: true })
  resolvedAt: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
