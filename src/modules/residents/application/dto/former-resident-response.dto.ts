import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FormerResidentListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  condominiumId: string;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  sourceResidentId: string;

  @ApiProperty({ enum: ['UPDATE', 'DELETE'] })
  reason: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ description: 'CPF mascarado' })
  cpfMasked: string;

  @ApiProperty()
  supersededAt: string;

  @ApiProperty()
  retainUntil: string;

  @ApiPropertyOptional({ nullable: true })
  supersededByUserId: string | null;
}

export class FormerResidentDetailDto extends FormerResidentListItemDto {
  @ApiProperty({ description: 'Snapshot completo do cadastro arquivado' })
  payload: Record<string, unknown>;
}
