import { ApiProperty } from '@nestjs/swagger';

import { SuggestionStatus } from '../../domain/enums/suggestion-status';

export class SuggestionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  unitNumber: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty()
  body: string;

  @ApiProperty({ enum: SuggestionStatus })
  status: SuggestionStatus;

  @ApiProperty()
  createdAt: string;
}
