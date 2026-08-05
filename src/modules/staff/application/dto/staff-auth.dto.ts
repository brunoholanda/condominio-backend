import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class StaffLoginDto {
  @ApiProperty({ example: '52998224725' })
  @IsString()
  cpf: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @Matches(/^\d{4,6}$/)
  pin: string;
}

export class StaffLoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  expiresInSeconds: number;

  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  condominiumName: string;
}

export class StaffMeResponseDto {
  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  jobTitle: string;

  @ApiProperty()
  condominiumName: string;

  @ApiPropertyOptional({ nullable: true })
  lastPunchType: string | null;

  @ApiProperty()
  nextPunchType: string;

  @ApiProperty()
  geofenceRadiusMeters: number;

  @ApiProperty()
  canAccessTimeClock: boolean;

  @ApiProperty()
  canAccessVisitors: boolean;

  @ApiProperty()
  canAccessDeliveries: boolean;

  @ApiPropertyOptional({ nullable: true })
  condominiumSlug?: string;

  @ApiProperty({ type: [String] })
  unitNumbers: string[];
}

export class ListPunchesQueryDto {
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
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({ enum: ['ACCEPTED', 'REJECTED'] })
  @IsOptional()
  @IsString()
  status?: string;
}
