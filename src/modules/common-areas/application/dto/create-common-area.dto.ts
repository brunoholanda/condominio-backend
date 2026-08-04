import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateCommonAreaDto {
  @ApiProperty({ example: 'Salão de festas' })
  @IsString()
  @Length(2, 150)
  name: string;

  @ApiPropertyOptional({ example: 'Espaço com capacidade para 60 pessoas.' })
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  description?: string | null;

  @ApiPropertyOptional({ example: 'Uso até as 22h. Silêncio após esse horário.' })
  @IsOptional()
  @IsString()
  @Length(1, 4000)
  rules?: string | null;

  @ApiPropertyOptional({ example: 0, description: 'Custo em centavos' })
  @IsOptional()
  @IsInt()
  @Min(0)
  costCents?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Aprova reservas automaticamente' })
  @IsOptional()
  @IsBoolean()
  autoApprove?: boolean;

  @ApiPropertyOptional({ example: 24, description: 'Antecedência mínima para reservar, em horas' })
  @IsOptional()
  @IsInt()
  @Min(0)
  minAdvanceHours?: number;

  @ApiPropertyOptional({ example: 24, description: 'Prazo mínimo para cancelar, em horas' })
  @IsOptional()
  @IsInt()
  @Min(0)
  cancelBeforeHours?: number;
}
