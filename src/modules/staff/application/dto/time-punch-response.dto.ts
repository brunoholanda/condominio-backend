import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PunchStatus, PunchType } from '../../domain/enums/staff.enums';

export class TimePunchResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  condominiumId: string;

  @ApiProperty({ format: 'uuid' })
  employeeId: string;

  @ApiPropertyOptional()
  employeeName?: string;

  @ApiProperty({ enum: PunchType })
  type: PunchType;

  @ApiProperty({ enum: PunchStatus })
  status: PunchStatus;

  @ApiProperty()
  punchedAt: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiPropertyOptional({ nullable: true })
  accuracyMeters: number | null;

  @ApiProperty()
  distanceMeters: number;

  @ApiProperty()
  hasSelfie: boolean;

  @ApiPropertyOptional({ nullable: true })
  rejectedReason: string | null;

  @ApiProperty()
  createdAt: string;
}
