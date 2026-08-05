import { ApiProperty } from '@nestjs/swagger';

export class DataInventorySectionDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  text: string;
}

export class DataInventoryResponseDto {
  @ApiProperty()
  version: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  intro: string;

  @ApiProperty({ type: [DataInventorySectionDto] })
  sections: DataInventorySectionDto[];
}
