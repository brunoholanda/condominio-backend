import { ApiPropertyOptional } from '@nestjs/swagger';
import { Allow, IsEnum, ValidateIf } from 'class-validator';

import { PlatformRole } from '../../../auth/domain/enums/platform-role';

export class SetPlatformRoleDto {
  @ApiPropertyOptional({
    enum: PlatformRole,
    nullable: true,
    description: 'SYSTEM_OWNER ou null para remover o papel de dono do sistema',
  })
  @Allow()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsEnum(PlatformRole)
  platformRole: PlatformRole | null;
}
