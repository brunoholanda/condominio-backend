import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PayableStatus } from '../../domain/enums/payable-status';

export class PayableResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  condominiumId: string;

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

  @ApiProperty({ enum: PayableStatus })
  status: PayableStatus;

  @ApiPropertyOptional({ nullable: true })
  paidAt: string | null;

  @ApiPropertyOptional({ nullable: true })
  notes: string | null;

  @ApiProperty({ format: 'uuid' })
  createdByUserId: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class PaginatedPayablesResponseDto {
  @ApiProperty({ type: [PayableResponseDto] })
  items: PayableResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
