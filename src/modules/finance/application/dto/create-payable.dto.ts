import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreatePayableDto {
  @ApiProperty({ example: 'Manutenção do elevador social' })
  @IsString()
  @Length(3, 200)
  description: string;

  @ApiProperty({ example: 'Elevadores Ápice Ltda.' })
  @IsString()
  @Length(2, 150)
  vendor: string;

  @ApiProperty({ example: 'Manutenção' })
  @IsString()
  @Length(2, 60)
  category: string;

  @ApiProperty({ example: 350000, description: 'Valor em centavos' })
  @IsInt()
  @Min(1)
  amountCents: number;

  @ApiProperty({ example: '2026-09-10' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({ example: 'Referente à visita de julho.' })
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  notes?: string | null;
}
