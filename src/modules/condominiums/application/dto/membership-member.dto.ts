import { ApiProperty } from '@nestjs/swagger';

import { MembershipRole } from '../../domain/enums/membership-role';

export class MembershipMemberDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: MembershipRole })
  role: MembershipRole;

  @ApiProperty()
  createdAt: string;
}
