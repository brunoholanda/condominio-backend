import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsUUID } from 'class-validator';

export class ReorderUsefulContactsDto {
  @ApiProperty({ type: [String], description: 'IDs dos contatos na nova ordem desejada' })
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  orderedIds: string[];
}
