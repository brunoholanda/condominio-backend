import { ApiProperty } from '@nestjs/swagger';

export class ResidentAccountResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty({ format: 'uuid' })
  condominiumId: string;

  @ApiProperty()
  unitNumber: string;

  @ApiProperty()
  createdAt: string;
}
