import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PlatformRole } from '../../../auth/domain/enums/platform-role';
import { SubscriptionPlan } from '../../../auth/domain/enums/subscription-plan';
import { SubscriptionStatus } from '../../../auth/domain/enums/subscription-status';

export class PlatformAccountDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({ nullable: true })
  cpf: string | null;

  @ApiPropertyOptional({ enum: PlatformRole, nullable: true })
  platformRole: PlatformRole | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isSystemOwner: boolean;

  @ApiProperty({ enum: SubscriptionPlan })
  plan: SubscriptionPlan;

  @ApiProperty({ enum: SubscriptionStatus })
  subscriptionStatus: SubscriptionStatus;

  @ApiProperty()
  trialEndsAt: string;

  @ApiPropertyOptional({ nullable: true })
  subscriptionUpdatedAt: string | null;

  @ApiProperty()
  createdAt: string;
}
