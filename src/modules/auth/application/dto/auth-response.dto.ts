import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PlatformRole } from '../../domain/enums/platform-role';
import { SubscriptionPlan } from '../../domain/enums/subscription-plan';
import { SubscriptionStatus } from '../../domain/enums/subscription-status';

export class AuthenticatedUserDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Somente dígitos. Nulo enquanto o operador não se identifica.',
  })
  cpf: string | null;

  @ApiPropertyOptional({
    enum: PlatformRole,
    nullable: true,
    description: 'Papel global da plataforma, quando houver',
  })
  platformRole: PlatformRole | null;

  @ApiProperty({ description: 'Conta liberada para login na plataforma' })
  isActive: boolean;

  @ApiProperty({ description: 'true quando a conta é dona do sistema' })
  isSystemOwner: boolean;

  @ApiProperty({ enum: SubscriptionPlan })
  plan: SubscriptionPlan;

  @ApiProperty({ enum: SubscriptionStatus })
  subscriptionStatus: SubscriptionStatus;

  @ApiProperty({ description: 'Fim do período de teste (ISO)' })
  trialEndsAt: string;

  @ApiPropertyOptional({ nullable: true })
  subscriptionUpdatedAt: string | null;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT a ser enviado no cabeçalho Authorization' })
  accessToken: string;

  @ApiProperty({ description: 'Validade do token, em segundos' })
  expiresIn: number;

  @ApiProperty({ type: AuthenticatedUserDto })
  user: AuthenticatedUserDto;
}
