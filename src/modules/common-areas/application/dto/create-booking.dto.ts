import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  commonAreaId: string;

  @ApiProperty({ example: '2026-09-20T18:00:00.000Z' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ example: '2026-09-20T23:00:00.000Z' })
  @IsDateString()
  endsAt: string;

  @ApiProperty({ example: true, description: 'Confirma a leitura das regras da área' })
  @IsBoolean()
  acceptRules: boolean;

  @ApiPropertyOptional({ example: 'Aniversário de 10 anos.' })
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  notes?: string | null;
}
