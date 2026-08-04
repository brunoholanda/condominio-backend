import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { MembershipRole } from '../../domain/enums/membership-role';
import { PUBLIC_HUB_LINKS, type PublicHubLink } from '../../domain/public-qr-target';

export class CondominiumResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional({ nullable: true, example: '2018-04-01' })
  buildingHandoverDate: string | null;

  @ApiProperty({ type: [String] })
  unitNumbers: string[];

  @ApiProperty({
    enum: PUBLIC_HUB_LINKS,
    isArray: true,
    description: 'Atalhos de serviço exibidos no hub público',
  })
  publicHubLinks: PublicHubLink[];

  @ApiPropertyOptional({ nullable: true })
  address: string | null;

  @ApiPropertyOptional({ nullable: true })
  latitude: number | null;

  @ApiPropertyOptional({ nullable: true })
  longitude: number | null;

  @ApiPropertyOptional({ nullable: true })
  geofenceRadiusMeters: number | null;

  @ApiPropertyOptional({
    enum: MembershipRole,
    description: 'Papel do usuário autenticado neste condomínio',
  })
  myRole?: MembershipRole;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class PublicCondominiumDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({
    enum: PUBLIC_HUB_LINKS,
    isArray: true,
    description: 'Atalhos de serviço visíveis neste hub',
  })
  publicHubLinks: PublicHubLink[];
}
