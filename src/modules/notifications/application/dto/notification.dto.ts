import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';

import { NotificationCategory } from '../../domain/enums/notification-category';

export class CreateNotificationDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  condominiumId: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Null = broadcast do condomínio' })
  @IsOptional()
  @IsUUID()
  userId?: string | null;

  @ApiProperty()
  @IsString()
  @Length(1, 200)
  title: string;

  @ApiProperty()
  @IsString()
  @Length(1, 2000)
  body: string;

  @ApiProperty({ enum: NotificationCategory })
  @IsEnum(NotificationCategory)
  category: NotificationCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 255)
  linkPath?: string | null;
}

export class ListNotificationsQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  condominiumId?: string;
}

export class NotificationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  condominiumId: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  userId: string | null;

  @ApiProperty()
  title: string;

  @ApiProperty()
  body: string;

  @ApiProperty({ enum: NotificationCategory })
  category: NotificationCategory;

  @ApiPropertyOptional({ nullable: true })
  linkPath: string | null;

  @ApiPropertyOptional({ nullable: true })
  readAt: string | null;

  @ApiProperty()
  createdAt: string;
}

export class UnreadCountResponseDto {
  @ApiProperty()
  count: number;
}

export class MarkAllReadResponseDto {
  @ApiProperty()
  updated: number;
}
