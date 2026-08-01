import { ApiProperty } from '@nestjs/swagger';

/** Panel of the restricted area: how much of the condo already answered the form. */
export class ResidentsSummaryDto {
  @ApiProperty({ example: 68, description: 'Unidades existentes no condomínio' })
  totalUnits: number;

  @ApiProperty({ example: 12, description: 'Unidades com o formulário preenchido' })
  registeredUnits: number;

  @ApiProperty({ example: 56, description: 'Unidades que ainda não preencheram' })
  pendingUnits: number;

  @ApiProperty({
    type: [String],
    example: ['101', '102', '203'],
    description: 'Quais unidades ainda não preencheram, em ordem',
  })
  pendingUnitNumbers: string[];

  @ApiProperty({
    example: 37,
    description: 'Pessoas que residem nas unidades cadastradas (titulares e moradores adicionais)',
  })
  totalPeople: number;
}
