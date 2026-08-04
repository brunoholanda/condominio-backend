import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { SubscriptionPlan } from '../../../auth/domain/enums/subscription-plan';

export class CreateCheckoutSessionDto {
  @ApiProperty({ enum: SubscriptionPlan })
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;
}

export class BillingRedirectDto {
  @ApiProperty({ description: 'URL do Stripe Checkout ou Portal' })
  url: string;
}
