import type { User } from '../../../auth/domain/entities/user';
import type { PlatformAccountDto } from '../dto/platform-account.dto';

export class PlatformAccountPresenter {
  static toResponse(user: User): PlatformAccountDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email.value,
      cpf: user.cpf?.value ?? null,
      platformRole: user.platformRole,
      isActive: user.isActive,
      isSystemOwner: user.isSystemOwner,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      trialEndsAt: user.trialEndsAt.toISOString(),
      subscriptionUpdatedAt: user.subscriptionUpdatedAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
