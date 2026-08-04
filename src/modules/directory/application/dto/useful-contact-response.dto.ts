import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ContactCategory } from '../../domain/enums/contact-category';

export class UsefulContactResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  condominiumId: string;

  @ApiProperty()
  label: string;

  @ApiPropertyOptional()
  phone: string | null;

  @ApiPropertyOptional()
  url: string | null;

  @ApiProperty({ enum: ContactCategory })
  category: ContactCategory;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;
}
