import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { MembershipRole } from '../../domain/enums/membership-role';

export class UpdateMembershipRoleDto {
  @ApiProperty({ enum: MembershipRole, example: MembershipRole.Manager })
  @IsEnum(MembershipRole)
  role: MembershipRole;
}
