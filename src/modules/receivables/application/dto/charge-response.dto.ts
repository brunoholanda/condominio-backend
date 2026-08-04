import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ChargeStatus } from '../../domain/enums/charge-status';

export class ChargeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  condominiumId: string;

  @ApiPropertyOptional({ nullable: true })
  batchId: string | null;

  @ApiProperty()
  unitNumber: string;

  @ApiPropertyOptional({ nullable: true })
  residentId: string | null;

  @ApiProperty()
  payerName: string;

  @ApiPropertyOptional({ nullable: true })
  payerCpf: string | null;

  @ApiProperty()
  description: string;

  @ApiProperty()
  amountCents: number;

  @ApiProperty()
  dueDate: string;

  @ApiProperty({ enum: ChargeStatus })
  status: ChargeStatus;

  /** Status exibido: OVERDUE quando pendente e vencida. */
  @ApiProperty({ enum: [...Object.values(ChargeStatus), 'OVERDUE'] })
  displayStatus: ChargeStatus | 'OVERDUE';

  @ApiPropertyOptional({ nullable: true })
  asaasPaymentId: string | null;

  @ApiPropertyOptional({ nullable: true })
  pixPayload: string | null;

  @ApiPropertyOptional({ nullable: true })
  pixQrCodeBase64: string | null;

  @ApiPropertyOptional({ nullable: true })
  pixExpirationDate: string | null;

  @ApiPropertyOptional({ nullable: true })
  invoiceUrl: string | null;

  @ApiPropertyOptional({ nullable: true })
  paidAt: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class PaginatedChargesResponseDto {
  @ApiProperty({ type: [ChargeResponseDto] })
  items: ChargeResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class ChargeSummaryResponseDto {
  @ApiProperty()
  pendingCount: number;

  @ApiProperty()
  paidCount: number;

  @ApiProperty()
  cancelledCount: number;

  @ApiProperty()
  pendingAmountCents: number;

  @ApiProperty()
  paidAmountCents: number;
}

export class AsaasSettingsResponseDto {
  @ApiProperty()
  configured: boolean;

  @ApiProperty()
  enabled: boolean;

  @ApiPropertyOptional({ nullable: true, description: 'Últimos caracteres da chave' })
  apiKeyHint: string | null;

  @ApiPropertyOptional({ nullable: true })
  walletId: string | null;
}

export class GenerateChargesResultDto {
  @ApiProperty()
  batchId: string;

  @ApiProperty({ type: [ChargeResponseDto] })
  created: ChargeResponseDto[];

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        unitNumber: { type: 'string' },
        error: { type: 'string' },
      },
    },
  })
  failures: Array<{ unitNumber: string; error: string }>;
}
