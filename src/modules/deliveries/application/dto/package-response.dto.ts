import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PackageStatus } from '../../domain/enums/package-status';

export class PackageListItemDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  unitNumber: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional({ nullable: true })
  carrier: string | null;

  @ApiProperty({ enum: PackageStatus })
  status: PackageStatus;

  @ApiProperty()
  receivedAt: string;

  @ApiPropertyOptional({ nullable: true })
  deliveredAt: string | null;

  @ApiPropertyOptional({ nullable: true })
  recipientName: string | null;

  @ApiPropertyOptional({ nullable: true })
  notes: string | null;
}

export class PackageResponseDto extends PackageListItemDto {
  @ApiProperty({ format: 'uuid' })
  condominiumId: string;

  @ApiProperty({ format: 'uuid' })
  receivedByUserId: string;

  @ApiPropertyOptional({ nullable: true, format: 'uuid' })
  deliveredByUserId: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Assinatura em data URL; só aparece após a entrega',
  })
  signature: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class PaginatedPackagesResponseDto {
  @ApiProperty({ type: [PackageListItemDto] })
  items: PackageListItemDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
