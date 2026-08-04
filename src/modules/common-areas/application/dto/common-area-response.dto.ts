import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CommonAreaResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  condominiumId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiPropertyOptional({ nullable: true })
  rules: string | null;

  @ApiProperty()
  costCents: number;

  @ApiProperty()
  capacity: number;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  autoApprove: boolean;

  @ApiProperty()
  minAdvanceHours: number;

  @ApiProperty()
  cancelBeforeHours: number;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
